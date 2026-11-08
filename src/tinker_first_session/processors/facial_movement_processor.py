"""Head pose estimation and facial tension analysis processor.

Subscribes to face-landmark data and publishes :class:`FacialMetrics`
containing head pose (pitch/yaw/roll), jaw openness, mouth aspect ratio,
brow raise, and a composite micro-expression tension score.
"""

from __future__ import annotations

import logging
import math

import cv2
import numpy as np

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.landmarks import (
    HEAD_POSE_LANDMARKS,
    HEAD_POSE_MODEL_POINTS,
    LEFT_BROW,
    LEFT_BROW_REFERENCE,
    LEFT_LIP_CORNER,
    LOWER_LIP,
    LOWER_LIP_BOTTOM,
    MOUTH_BOTTOM_INNER,
    MOUTH_TOP_INNER,
    NOSE_TIP,
    CHIN,
    RIGHT_BROW,
    RIGHT_BROW_REFERENCE,
    RIGHT_LIP_CORNER,
    UPPER_LIP,
    UPPER_LIP_TOP,
)
from tinker_first_session.core.messages import (
    Channel,
    FaceLandmarks,
    FacialMetrics,
    StampedMessage,
)

logger = logging.getLogger(__name__)

# ── Constants ───────────────────────────────────────────────────────────────

_DIST_COEFFS = np.zeros((4, 1), dtype=np.float64)
"""Assume no lens distortion for the webcam approximation."""

# Tension score weights (sum to 1.0).
_W_JAW_CLENCH: float = 0.30
_W_BROW_TENSION: float = 0.30
_W_LIP_COMPRESS: float = 0.20
_W_HEAD_MOVEMENT: float = 0.20


# ── Processor ───────────────────────────────────────────────────────────────


class FacialMovementProcessor(BaseProcessor):
    """Estimate head pose and compute facial tension indicators.

    **Metrics produced** (published as :class:`FacialMetrics`):

    * **Head pose** — pitch, yaw, roll in degrees via ``cv2.solvePnP``.
    * **Jaw openness** — normalised lip separation (yawn indicator).
    * **Mouth Aspect Ratio (MAR)** — vertical/horizontal mouth ratio.
    * **Brow raise** — average brow-to-eyelid distance, normalised.
    * **Micro-expression tension** — weighted composite score in [0, 1].
    """

    def __init__(self, broker: MessageBroker) -> None:
        super().__init__(broker, Channel.FACE_LANDMARKS, Channel.FACIAL_METRICS)

    # ── Core processing ─────────────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> FacialMetrics | None:
        """Compute facial metrics for a single frame of landmarks."""
        landmarks: FaceLandmarks = msg.payload  # type: ignore[assignment]
        pts = landmarks.landmarks  # (478, 3) float32
        img_w = landmarks.image_width
        img_h = landmarks.image_height

        # 1. Head pose (pitch, yaw, roll).
        pitch, yaw, roll = _compute_head_pose(pts, img_w, img_h)

        # 2. Jaw openness (normalised).
        jaw_openness = _compute_jaw_openness(pts)

        # 3. Mouth Aspect Ratio (MAR).
        mar = _compute_mar(pts)

        # 4. Brow raise (normalised).
        brow_raise = _compute_brow_raise(pts)

        # 5. Micro-expression tension composite.
        tension = _compute_tension(jaw_openness, brow_raise, mar, pitch, yaw, roll)

        return FacialMetrics(
            jaw_openness=jaw_openness,
            brow_raise=brow_raise,
            head_pitch=pitch,
            head_yaw=yaw,
            head_roll=roll,
            mouth_aspect_ratio=mar,
            micro_expression_tension=tension,
        )


# ── Head pose ───────────────────────────────────────────────────────────────


def _compute_head_pose(
    landmarks: np.ndarray,
    image_width: int,
    image_height: int,
) -> tuple[float, float, float]:
    """Estimate head pose (pitch, yaw, roll) using ``cv2.solvePnP``.

    Parameters
    ----------
    landmarks : np.ndarray
        Full face landmarks, shape ``(478, 3)`` in normalised [0, 1] coords.
    image_width, image_height : int
        Original frame dimensions for constructing the camera matrix.

    Returns
    -------
    pitch, yaw, roll : float
        Head orientation in degrees.
    """
    # Build 2-D image points from the normalised landmarks.
    image_points = np.array(
        [
            [landmarks[idx][0] * image_width, landmarks[idx][1] * image_height]
            for idx in HEAD_POSE_LANDMARKS
        ],
        dtype=np.float64,
    )

    # Approximate camera intrinsics.
    focal_length = float(image_width)
    cx = image_width / 2.0
    cy = image_height / 2.0
    camera_matrix = np.array(
        [
            [focal_length, 0.0, cx],
            [0.0, focal_length, cy],
            [0.0, 0.0, 1.0],
        ],
        dtype=np.float64,
    )

    success, rvec, tvec = cv2.solvePnP(
        HEAD_POSE_MODEL_POINTS,
        image_points,
        camera_matrix,
        _DIST_COEFFS,
        flags=cv2.SOLVEPNP_ITERATIVE,
    )
    if not success:
        logger.warning("solvePnP failed — returning zero pose.")
        return 0.0, 0.0, 0.0

    # Convert rotation vector → rotation matrix → Euler angles.
    rmat, _ = cv2.Rodrigues(rvec)
    pitch, yaw, roll = _rotation_matrix_to_euler(rmat)

    return pitch, yaw, roll


def _rotation_matrix_to_euler(rmat: np.ndarray) -> tuple[float, float, float]:
    """Convert a 3×3 rotation matrix to Euler angles (pitch, yaw, roll).

    Uses the Y-X-Z convention common in head-pose estimation:
    pitch = rotation about X, yaw = rotation about Y, roll = rotation about Z.

    Returns
    -------
    pitch, yaw, roll : float
        Angles in degrees.
    """
    sy = math.sqrt(rmat[0, 0] ** 2 + rmat[1, 0] ** 2)

    if sy > 1e-6:
        pitch = math.atan2(rmat[2, 1], rmat[2, 2])
        yaw = math.atan2(-rmat[2, 0], sy)
        roll = math.atan2(rmat[1, 0], rmat[0, 0])
    else:
        pitch = math.atan2(-rmat[1, 2], rmat[1, 1])
        yaw = math.atan2(-rmat[2, 0], sy)
        roll = 0.0

    return math.degrees(pitch), math.degrees(yaw), math.degrees(roll)


# ── Jaw openness ────────────────────────────────────────────────────────────


def _compute_jaw_openness(landmarks: np.ndarray) -> float:
    """Compute normalised jaw opening from lip and face landmarks.

    The vertical distance between the upper lip (13) and lower lip (14) is
    normalised by the face height (nose tip to chin distance).

    Returns
    -------
    float
        Jaw openness in ``[0, 1]``.
    """
    upper = landmarks[UPPER_LIP]
    lower = landmarks[LOWER_LIP]
    nose = landmarks[NOSE_TIP]
    chin = landmarks[CHIN]

    lip_dist = float(np.linalg.norm(upper - lower))
    face_height = float(np.linalg.norm(nose - chin))

    if face_height < 1e-8:
        return 0.0

    return min(1.0, lip_dist / face_height)


# ── Mouth Aspect Ratio ─────────────────────────────────────────────────────


def _compute_mar(landmarks: np.ndarray) -> float:
    """Compute Mouth Aspect Ratio (MAR), analogous to EAR for the mouth.

    MAR = (‖top_inner − bottom_inner‖ + ‖upper_top − lower_bottom‖) /
          (2 · ‖left_corner − right_corner‖)

    A higher MAR indicates a more open mouth (potential yawn).
    """
    top_inner = landmarks[MOUTH_TOP_INNER]
    bottom_inner = landmarks[MOUTH_BOTTOM_INNER]
    upper_top = landmarks[UPPER_LIP_TOP]
    lower_bottom = landmarks[LOWER_LIP_BOTTOM]
    left_corner = landmarks[LEFT_LIP_CORNER]
    right_corner = landmarks[RIGHT_LIP_CORNER]

    vertical_a = float(np.linalg.norm(top_inner - bottom_inner))
    vertical_b = float(np.linalg.norm(upper_top - lower_bottom))
    horizontal = float(np.linalg.norm(left_corner - right_corner))

    if horizontal < 1e-8:
        return 0.0

    return (vertical_a + vertical_b) / (2.0 * horizontal)


# ── Brow raise ──────────────────────────────────────────────────────────────


def _compute_brow_raise(landmarks: np.ndarray) -> float:
    """Compute normalised brow elevation.

    Averages the distance from each brow landmark to its eyelid reference
    point, normalised by the face height (nose-to-chin).

    Returns
    -------
    float
        Brow raise in ``[0, 1]``.
    """
    nose = landmarks[NOSE_TIP]
    chin = landmarks[CHIN]
    face_height = float(np.linalg.norm(nose - chin))

    if face_height < 1e-8:
        return 0.0

    # Left brow.
    left_ref = landmarks[LEFT_BROW_REFERENCE]
    left_dists = [
        float(np.linalg.norm(landmarks[idx] - left_ref)) for idx in LEFT_BROW
    ]

    # Right brow.
    right_ref = landmarks[RIGHT_BROW_REFERENCE]
    right_dists = [
        float(np.linalg.norm(landmarks[idx] - right_ref)) for idx in RIGHT_BROW
    ]

    avg_dist = (sum(left_dists) + sum(right_dists)) / (
        len(left_dists) + len(right_dists)
    )

    # Normalise by face height and scale to a reasonable [0, 1] range.
    # Empirically brow-to-eyelid distance is ~5-15 % of face height.
    normalised = avg_dist / face_height
    return min(1.0, normalised * 5.0)  # scale factor to fill [0, 1]


# ── Micro-expression tension ───────────────────────────────────────────────


def _compute_tension(
    jaw_openness: float,
    brow_raise: float,
    mar: float,
    pitch: float,
    yaw: float,
    roll: float,
) -> float:
    """Compute a composite micro-expression tension score in ``[0, 1]``.

    The score is a weighted average of:

    * **Jaw clenching** — low jaw openness indicates a clenched jaw.
    * **Brow tension** — elevated brows suggest stress or surprise.
    * **Lip compression** — low MAR indicates pressed-together lips.
    * **Head movement** — large deviations from neutral suggest discomfort.

    Parameters
    ----------
    jaw_openness : float
        Normalised jaw opening ``[0, 1]``.
    brow_raise : float
        Normalised brow elevation ``[0, 1]``.
    mar : float
        Mouth Aspect Ratio.
    pitch, yaw, roll : float
        Head orientation in degrees.

    Returns
    -------
    float
        Tension score in ``[0, 1]``.
    """
    # Jaw clenching: tension is HIGH when jaw is closed (low openness).
    jaw_tension = 1.0 - min(1.0, jaw_openness * 3.0)  # scale up, invert

    # Brow tension: directly proportional to raise (furrowed / raised).
    brow_tension = min(1.0, brow_raise)

    # Lip compression: tension is HIGH when mouth is tightly closed.
    lip_tension = 1.0 - min(1.0, mar * 3.0)

    # Head movement: large angular deviation from neutral → discomfort.
    # Neutral ≈ 0° for all axes; map deviation to [0, 1].
    head_deviation = (abs(pitch) + abs(yaw) + abs(roll)) / 90.0  # 90° = max
    head_tension = min(1.0, head_deviation)

    tension = (
        _W_JAW_CLENCH * jaw_tension
        + _W_BROW_TENSION * brow_tension
        + _W_LIP_COMPRESS * lip_tension
        + _W_HEAD_MOVEMENT * head_tension
    )

    return max(0.0, min(1.0, tension))
