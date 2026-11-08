"""Webcam capture → MediaPipe FaceMesh → FaceLandmarks publisher.

This module is the **source node** of the fatigue-tracking pipeline.  It
opens the system webcam via OpenCV, runs MediaPipe FaceMesh inference on
every frame, and publishes a :class:`FaceLandmarks` message to the broker.

Design notes
------------
* ``cv2.VideoCapture.read()`` is blocking I/O and **must not** stall the
  async event loop.  Frame capture and MediaPipe inference are therefore
  dispatched to the default thread-pool executor via
  :func:`asyncio.to_thread`.
* MediaPipe FaceMesh is configured with ``refine_landmarks=True`` so the
  full 478-landmark set (468 face + 10 iris) is available.
* CameraProcessor does **not** subclass :class:`BaseProcessor` — it is a
  pure *publisher* (the pipeline source), never a subscriber.
"""

from __future__ import annotations

import asyncio
import logging
import time

import cv2
import mediapipe as mp
import numpy as np

from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.messages import Channel, FaceLandmarks

logger = logging.getLogger(__name__)

# MediaPipe solution aliases
_mp_face_mesh = mp.solutions.face_mesh

# Iris landmark index ranges (inclusive).
_LEFT_IRIS_START = 468
_LEFT_IRIS_END = 473  # exclusive → indices 468-472
_RIGHT_IRIS_START = 473
_RIGHT_IRIS_END = 478  # exclusive → indices 473-477

# How often (in seconds) to log an FPS report.
_FPS_LOG_INTERVAL_S = 5.0


class CameraProcessor:
    """Captures webcam frames, runs FaceMesh, and publishes landmarks.

    Parameters
    ----------
    broker : MessageBroker
        The shared message broker to publish :data:`Channel.FACE_LANDMARKS`
        messages on.
    camera_index : int
        OpenCV ``VideoCapture`` device index.  ``0`` is typically the
        built-in webcam.
    target_fps : int
        Target capture rate.  The capture loop sleeps to stay close to
        this rate; actual FPS depends on camera and processing speed.
    """

    def __init__(
        self,
        broker: MessageBroker,
        camera_index: int = 0,
        target_fps: int = 30,
    ) -> None:
        self._broker = broker
        self._camera_index = camera_index
        self._target_fps = target_fps
        self._frame_interval = 1.0 / target_fps

        # Initialised lazily in _capture_loop so we stay off-thread at
        # construction time.
        self._cap: cv2.VideoCapture | None = None
        self._face_mesh: _mp_face_mesh.FaceMesh | None = None
        self._task: asyncio.Task | None = None

        # FPS bookkeeping
        self._frame_count: int = 0
        self._fps_timer: float = 0.0

    # ── public lifecycle ────────────────────────────────────────────────

    async def start(self) -> asyncio.Task:
        """Open the camera and begin the capture loop.

        Returns
        -------
        asyncio.Task
            The background task running :meth:`_capture_loop`.
        """
        self._task = asyncio.create_task(
            self._capture_loop(), name="CameraProcessor"
        )
        logger.info(
            "CameraProcessor scheduled (device=%d, target_fps=%d)",
            self._camera_index,
            self._target_fps,
        )
        return self._task

    async def stop(self) -> None:
        """Cancel the capture task and release hardware resources."""
        if self._task is not None and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self._release()
        logger.info("CameraProcessor stopped")

    # ── capture loop ────────────────────────────────────────────────────

    async def _capture_loop(self) -> None:
        """Main async loop: read frame → process → publish → pace."""
        # Initialise camera and MediaPipe on first iteration.
        if not await asyncio.to_thread(self._open_camera):
            logger.error(
                "CameraProcessor: could not open camera %d — exiting",
                self._camera_index,
            )
            return

        self._face_mesh = _mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._fps_timer = time.monotonic()
        logger.info(
            "CameraProcessor: camera %d opened (%dx%d)",
            self._camera_index,
            int(self._cap.get(cv2.CAP_PROP_FRAME_WIDTH)),  # type: ignore[union-attr]
            int(self._cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),  # type: ignore[union-attr]
        )

        try:
            while True:
                loop_start = time.monotonic()

                # Blocking read in a worker thread.
                ret, frame = await asyncio.to_thread(self._cap.read)  # type: ignore[union-attr]
                if not ret or frame is None:
                    logger.warning("CameraProcessor: frame read failed — retrying")
                    await asyncio.sleep(0.1)
                    continue

                # Heavy MediaPipe inference also in a worker thread.
                result = await asyncio.to_thread(self._process_frame, frame)
                if result is not None:
                    self._broker.publish(Channel.FACE_LANDMARKS, result)

                # FPS accounting & periodic logging.
                self._frame_count += 1
                now = time.monotonic()
                elapsed = now - self._fps_timer
                if elapsed >= _FPS_LOG_INTERVAL_S:
                    fps = self._frame_count / elapsed
                    logger.info("CameraProcessor: %.1f FPS", fps)
                    self._frame_count = 0
                    self._fps_timer = now

                # Pace the loop to respect target_fps.
                processing_time = time.monotonic() - loop_start
                sleep_time = self._frame_interval - processing_time
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("CameraProcessor: unhandled error in capture loop")
            raise
        finally:
            self._release()

    # ── frame processing (synchronous, runs in executor) ────────────────

    def _process_frame(self, frame: np.ndarray) -> FaceLandmarks | None:
        """Run MediaPipe FaceMesh on *frame* and return a payload.

        Parameters
        ----------
        frame : np.ndarray
            BGR image from ``cv2.VideoCapture.read()``.

        Returns
        -------
        FaceLandmarks | None
            Extracted landmarks, or ``None`` if no face was detected.
        """
        h, w = frame.shape[:2]

        # MediaPipe expects RGB input.
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self._face_mesh.process(rgb)  # type: ignore[union-attr]

        if not results.multi_face_landmarks:
            return None

        face = results.multi_face_landmarks[0]

        # --- Full landmark array (478, 3) float32 ---
        landmarks = np.array(
            [(lm.x, lm.y, lm.z) for lm in face.landmark],
            dtype=np.float32,
        )

        # --- Iris sub-arrays ---
        iris_left = landmarks[_LEFT_IRIS_START:_LEFT_IRIS_END]    # (5, 3)
        iris_right = landmarks[_RIGHT_IRIS_START:_RIGHT_IRIS_END]  # (5, 3)

        # --- Bounding box from all landmarks (normalised) ---
        xs = landmarks[:, 0]
        ys = landmarks[:, 1]
        x_min, x_max = float(xs.min()), float(xs.max())
        y_min, y_max = float(ys.min()), float(ys.max())
        bbox = (x_min, y_min, x_max - x_min, y_max - y_min)

        # --- Detection confidence ---
        # FaceMesh doesn't expose per-frame detection confidence on
        # multi_face_landmarks.  Use the dedicated detection output when
        # available, otherwise default to 1.0.
        confidence = 1.0
        if results.multi_face_landmarks and hasattr(results, "multi_face_detection_confidence"):
            # Future-proof: MediaPipe may expose this in later versions.
            confidence = float(results.multi_face_detection_confidence[0])  # pragma: no cover

        return FaceLandmarks(
            landmarks=landmarks,
            iris_left=iris_left,
            iris_right=iris_right,
            face_bbox=bbox,
            detection_confidence=confidence,
            image_width=w,
            image_height=h,
        )

    # ── internal helpers ────────────────────────────────────────────────

    def _open_camera(self) -> bool:
        """Open the ``VideoCapture`` device.  Returns *True* on success."""
        self._cap = cv2.VideoCapture(self._camera_index)
        if not self._cap.isOpened():
            logger.error(
                "CameraProcessor: VideoCapture(%d) failed to open",
                self._camera_index,
            )
            self._cap.release()
            self._cap = None
            return False
        return True

    def _release(self) -> None:
        """Release camera and MediaPipe resources idempotently."""
        if self._face_mesh is not None:
            self._face_mesh.close()
            self._face_mesh = None
        if self._cap is not None:
            self._cap.release()
            self._cap = None
