"""Blink pattern analysis processor.

Subscribes to face-landmark data and publishes :class:`BlinkMetrics`
containing Eye Aspect Ratios, blink counts, blink duration, and PERCLOS.
"""

from __future__ import annotations

import logging
from collections import deque
from dataclasses import dataclass

import numpy as np

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.landmarks import LEFT_EYE, RIGHT_EYE
from tinker_first_session.core.messages import (
    BlinkMetrics,
    Channel,
    FaceLandmarks,
    StampedMessage,
)

logger = logging.getLogger(__name__)

# ── Constants ───────────────────────────────────────────────────────────────

_EAR_BLINK_THRESHOLD: float = 0.21
"""EAR value below which the eye is considered closed (blink candidate)."""

_EAR_PERCLOS_THRESHOLD: float = 0.20
"""EAR value below which the eye is considered ≥80 % closed for PERCLOS."""

_MIN_BLINK_FRAMES: int = 2
"""Minimum consecutive below-threshold frames to register a blink."""

_WINDOW_SECONDS: float = 60.0
"""Rolling window duration for blinks-per-minute and PERCLOS (seconds)."""

_NS_PER_SECOND: float = 1_000_000_000.0
_NS_PER_MS: float = 1_000_000.0


# ── Internal bookkeeping ────────────────────────────────────────────────────

@dataclass(slots=True)
class _BlinkEvent:
    """Stores the start time of a completed blink (for BPM rolling window)."""

    timestamp_ns: int


@dataclass(slots=True)
class _EarSample:
    """Stores an EAR sample with its timestamp (for PERCLOS calculation)."""

    timestamp_ns: int
    ear: float


# ── Processor ───────────────────────────────────────────────────────────────


class SaccadeProcessor(BaseProcessor):
    """Analyse blink patterns from face-landmark streams.

    **Metrics produced** (published as :class:`BlinkMetrics`):

    * **EAR** — Eye Aspect Ratio per eye and average.
    * **Blink detection** — EAR below threshold for ≥2 consecutive frames.
    * **Blink duration** — measured via monotonic timestamps.
    * **Blinks per minute** — count over a 60-second rolling window.
    * **PERCLOS** — fraction of time eyes are ≥80 % closed in the window.
    """

    def __init__(self, broker: MessageBroker) -> None:
        super().__init__(broker, Channel.FACE_LANDMARKS, Channel.BLINK_METRICS)

        # ── Blink-detection state ───────────────────────────────────────
        self._consecutive_below: int = 0
        """Count of consecutive frames with avg EAR < blink threshold."""

        self._blink_start_ns: int | None = None
        """Monotonic timestamp when the current blink candidate started."""

        self._in_blink: bool = False
        """Whether we are currently inside a confirmed blink event."""

        self._current_blink_duration_ms: float = 0.0
        """Duration (ms) of the blink in progress (0 when not blinking)."""

        # ── Rolling windows ─────────────────────────────────────────────
        self._blink_events: deque[_BlinkEvent] = deque()
        """Timestamps of completed blinks within the rolling window."""

        self._ear_samples: deque[_EarSample] = deque()
        """Recent EAR samples for PERCLOS computation."""

    # ── Core processing ─────────────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> BlinkMetrics | None:
        """Compute blink metrics for a single frame of landmarks."""
        landmarks: FaceLandmarks = msg.payload  # type: ignore[assignment]
        pts = landmarks.landmarks  # (478, 3) float32

        # 1. Compute EAR for each eye.
        ear_left = _compute_ear(pts, LEFT_EYE)
        ear_right = _compute_ear(pts, RIGHT_EYE)
        ear_avg = (ear_left + ear_right) / 2.0

        now_ns: int = msg.timestamp

        # 2. Store sample for PERCLOS.
        self._ear_samples.append(_EarSample(timestamp_ns=now_ns, ear=ear_avg))

        # 3. Blink detection state machine.
        is_blink, blink_duration_ms = self._update_blink_state(ear_avg, now_ns)

        # 4. Prune rolling windows.
        cutoff_ns = now_ns - int(_WINDOW_SECONDS * _NS_PER_SECOND)
        _prune_deque(self._blink_events, cutoff_ns)
        _prune_deque(self._ear_samples, cutoff_ns)

        # 5. Blinks per minute.
        window_span_s = self._window_span_seconds(self._ear_samples, now_ns)
        bpm = (
            len(self._blink_events) * 60.0 / window_span_s
            if window_span_s > 0.0
            else 0.0
        )

        # 6. PERCLOS — fraction of samples below the PERCLOS threshold.
        perclos = self._compute_perclos()

        return BlinkMetrics(
            ear_left=ear_left,
            ear_right=ear_right,
            ear_avg=ear_avg,
            is_blink=is_blink,
            blink_duration_ms=blink_duration_ms,
            blinks_per_minute=bpm,
            perclos=perclos,
        )

    # ── Blink state machine ─────────────────────────────────────────────

    def _update_blink_state(self, ear_avg: float, now_ns: int) -> tuple[bool, float]:
        """Track blink onset/offset.

        Returns
        -------
        is_blink : bool
            ``True`` while the eyes are in a confirmed blink.
        blink_duration_ms : float
            Duration of the current blink in milliseconds (0 if not blinking).
        """
        if ear_avg < _EAR_BLINK_THRESHOLD:
            # Eye is below threshold.
            self._consecutive_below += 1

            if self._blink_start_ns is None:
                self._blink_start_ns = now_ns

            if self._consecutive_below >= _MIN_BLINK_FRAMES:
                self._in_blink = True
                self._current_blink_duration_ms = (
                    (now_ns - self._blink_start_ns) / _NS_PER_MS
                )
        else:
            # Eye opened — finalise any active blink.
            if self._in_blink and self._blink_start_ns is not None:
                self._blink_events.append(_BlinkEvent(timestamp_ns=now_ns))
                logger.debug(
                    "Blink completed: %.1f ms",
                    (now_ns - self._blink_start_ns) / _NS_PER_MS,
                )

            # Reset state.
            self._consecutive_below = 0
            self._blink_start_ns = None
            self._in_blink = False
            self._current_blink_duration_ms = 0.0

        return self._in_blink, self._current_blink_duration_ms

    # ── PERCLOS ─────────────────────────────────────────────────────────

    def _compute_perclos(self) -> float:
        """Compute PERCLOS: percentage of time eyes ≥80 % closed.

        Uses the proportion of EAR samples below :data:`_EAR_PERCLOS_THRESHOLD`
        in the rolling window.
        """
        if not self._ear_samples:
            return 0.0

        total = len(self._ear_samples)
        closed = sum(1 for s in self._ear_samples if s.ear < _EAR_PERCLOS_THRESHOLD)
        return closed / total

    # ── Helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _window_span_seconds(
        samples: deque[_EarSample], now_ns: int
    ) -> float:
        """Return the elapsed seconds covered by *samples* up to *now_ns*."""
        if not samples:
            return 0.0
        return (now_ns - samples[0].timestamp_ns) / _NS_PER_SECOND


# ── Pure helper functions ───────────────────────────────────────────────────


def _compute_ear(landmarks: np.ndarray, eye_indices: tuple[int, ...]) -> float:
    """Compute the Eye Aspect Ratio (EAR) for a single eye.

    Uses the classic 6-landmark formula::

        EAR = (‖P2 − P6‖ + ‖P3 − P5‖) / (2 · ‖P1 − P4‖)

    Parameters
    ----------
    landmarks : np.ndarray
        Full landmark array of shape ``(478, 3)``.
    eye_indices : tuple[int, ...]
        Six landmark indices ``(P1, P2, P3, P4, P5, P6)`` for the eye.

    Returns
    -------
    float
        EAR value (typically 0.15–0.45 when open, <0.21 when closed).
    """
    p1, p2, p3, p4, p5, p6 = (landmarks[i] for i in eye_indices)

    # Vertical distances.
    vertical_a = float(np.linalg.norm(p2 - p6))
    vertical_b = float(np.linalg.norm(p3 - p5))

    # Horizontal distance.
    horizontal = float(np.linalg.norm(p1 - p4))

    if horizontal < 1e-8:
        return 0.0

    return (vertical_a + vertical_b) / (2.0 * horizontal)


def _prune_deque(dq: deque, cutoff_ns: int) -> None:
    """Remove entries with ``timestamp_ns`` older than *cutoff_ns*."""
    while dq and dq[0].timestamp_ns < cutoff_ns:
        dq.popleft()
