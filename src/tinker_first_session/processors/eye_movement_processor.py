"""Gaze direction and saccade analysis processor.

Subscribes to face-landmark data and publishes :class:`GazeMetrics`
containing gaze direction, saccade detection, fixation duration, saccade
rate, and gaze entropy.
"""

from __future__ import annotations

import logging
import math
from collections import deque
from dataclasses import dataclass

import numpy as np

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.landmarks import (
    LEFT_EYE_INNER_CORNER,
    LEFT_EYE_OUTER_CORNER,
    LEFT_IRIS,
    RIGHT_EYE_INNER_CORNER,
    RIGHT_EYE_OUTER_CORNER,
    RIGHT_IRIS,
)
from tinker_first_session.core.messages import (
    Channel,
    FaceLandmarks,
    GazeMetrics,
    StampedMessage,
)

logger = logging.getLogger(__name__)

# ── Constants ───────────────────────────────────────────────────────────────

_SACCADE_VELOCITY_THRESHOLD: float = 2.0
"""Normalised-units / second above which a gaze shift is classified as a saccade."""

_FIXATION_RADIUS: float = 0.05
"""Maximum gaze displacement (normalised units) to remain in a fixation."""

_ENTROPY_GRID_SIZE: int = 5
"""Side length of the square grid used for gaze entropy discretisation."""

_WINDOW_SECONDS: float = 60.0
"""Rolling window length for saccade rate and entropy (seconds)."""

_NS_PER_SECOND: float = 1_000_000_000.0
_NS_PER_MS: float = 1_000_000.0


# ── Internal bookkeeping ────────────────────────────────────────────────────

@dataclass(slots=True)
class _SaccadeEvent:
    """Timestamp of a detected saccade (for rolling SPM count)."""

    timestamp_ns: int


@dataclass(slots=True)
class _GazeSample:
    """A gaze position sample for entropy and rolling window tracking."""

    timestamp_ns: int
    x: float
    y: float


# ── Processor ───────────────────────────────────────────────────────────────


class EyeMovementProcessor(BaseProcessor):
    """Analyse gaze direction and saccade patterns from face landmarks.

    **Metrics produced** (published as :class:`GazeMetrics`):

    * **Gaze direction** — normalised (x, y) from iris position within the eye.
    * **Saccade velocity** — frame-to-frame gaze speed in normalised units/s.
    * **Fixation duration** — time gaze remains within a small radius.
    * **Saccades per minute** — count over a 60-second rolling window.
    * **Gaze entropy** — Shannon entropy of the gaze heatmap on a 5×5 grid.
    """

    def __init__(self, broker: MessageBroker) -> None:
        super().__init__(broker, Channel.FACE_LANDMARKS, Channel.GAZE_METRICS)

        # ── Previous-frame state ────────────────────────────────────────
        self._prev_gaze: np.ndarray | None = None
        """Previous frame's gaze position for velocity calculation."""

        self._prev_timestamp_ns: int | None = None
        """Monotonic timestamp of the previous frame."""

        # ── Fixation tracking ───────────────────────────────────────────
        self._fixation_start_ns: int | None = None
        """When the current fixation began."""

        self._fixation_anchor: np.ndarray | None = None
        """The gaze position at which the current fixation started."""

        # ── Rolling windows ─────────────────────────────────────────────
        self._saccade_events: deque[_SaccadeEvent] = deque()
        """Detected saccades within the rolling window."""

        self._gaze_samples: deque[_GazeSample] = deque()
        """Recent gaze positions for entropy computation."""

    # ── Core processing ─────────────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> GazeMetrics | None:
        """Compute gaze and saccade metrics for a single frame."""
        landmarks: FaceLandmarks = msg.payload  # type: ignore[assignment]
        pts = landmarks.landmarks  # (478, 3) float32
        now_ns: int = msg.timestamp

        # 1. Compute gaze direction.
        gaze = _compute_gaze_direction(pts)

        # 2. Store gaze sample.
        self._gaze_samples.append(
            _GazeSample(timestamp_ns=now_ns, x=float(gaze[0]), y=float(gaze[1]))
        )

        # 3. Compute saccade velocity.
        velocity = 0.0
        if self._prev_gaze is not None and self._prev_timestamp_ns is not None:
            dt_s = (now_ns - self._prev_timestamp_ns) / _NS_PER_SECOND
            if dt_s > 0:
                displacement = float(np.linalg.norm(gaze - self._prev_gaze))
                velocity = displacement / dt_s

                # Record saccade event if velocity exceeds threshold.
                if velocity > _SACCADE_VELOCITY_THRESHOLD:
                    self._saccade_events.append(_SaccadeEvent(timestamp_ns=now_ns))

        # 4. Fixation tracking.
        fixation_duration_ms = self._update_fixation(gaze, now_ns)

        # 5. Update previous-frame state.
        self._prev_gaze = gaze.copy()
        self._prev_timestamp_ns = now_ns

        # 6. Prune rolling windows.
        cutoff_ns = now_ns - int(_WINDOW_SECONDS * _NS_PER_SECOND)
        _prune_deque(self._saccade_events, cutoff_ns)
        _prune_deque(self._gaze_samples, cutoff_ns)

        # 7. Saccades per minute.
        window_span_s = self._window_span_seconds(now_ns)
        spm = (
            len(self._saccade_events) * 60.0 / window_span_s
            if window_span_s > 0.0
            else 0.0
        )

        # 8. Gaze entropy.
        entropy = self._compute_gaze_entropy()

        return GazeMetrics(
            gaze_direction=gaze,
            saccade_velocity=velocity,
            fixation_duration_ms=fixation_duration_ms,
            saccade_count_per_minute=spm,
            gaze_entropy=entropy,
        )

    # ── Fixation tracking ───────────────────────────────────────────────

    def _update_fixation(self, gaze: np.ndarray, now_ns: int) -> float:
        """Update fixation state and return the current fixation duration (ms).

        A fixation is maintained while gaze stays within
        :data:`_FIXATION_RADIUS` of the anchor point.  When gaze moves
        outside the radius a new fixation begins.
        """
        if self._fixation_anchor is None:
            # First frame — start a new fixation.
            self._fixation_anchor = gaze.copy()
            self._fixation_start_ns = now_ns
            return 0.0

        displacement = float(np.linalg.norm(gaze - self._fixation_anchor))

        if displacement <= _FIXATION_RADIUS:
            # Still within fixation radius.
            assert self._fixation_start_ns is not None
            return (now_ns - self._fixation_start_ns) / _NS_PER_MS
        else:
            # Gaze moved — reset fixation.
            self._fixation_anchor = gaze.copy()
            self._fixation_start_ns = now_ns
            return 0.0

    # ── Gaze entropy ────────────────────────────────────────────────────

    def _compute_gaze_entropy(self) -> float:
        """Compute Shannon entropy of the gaze distribution on a grid.

        Discretises gaze positions into a :data:`_ENTROPY_GRID_SIZE` × grid
        over the rolling window and computes the entropy of the resulting
        probability distribution.  Higher entropy indicates more dispersed
        gaze (potentially less focused attention).
        """
        if len(self._gaze_samples) < 2:
            return 0.0

        grid = _ENTROPY_GRID_SIZE
        counts = np.zeros(grid * grid, dtype=np.float64)

        for sample in self._gaze_samples:
            # Clamp to [0, 1) and discretise.
            gx = min(max(sample.x, 0.0), 0.9999)
            gy = min(max(sample.y, 0.0), 0.9999)
            col = int(gx * grid)
            row = int(gy * grid)
            counts[row * grid + col] += 1.0

        # Normalise to a probability distribution.
        total = counts.sum()
        if total == 0:
            return 0.0

        probs = counts / total

        # Shannon entropy: -Σ p·log₂(p)  (skip zero-probability cells).
        nonzero = probs[probs > 0]
        entropy = -float(np.sum(nonzero * np.log2(nonzero)))
        return entropy

    # ── Helpers ──────────────────────────────────────────────────────────

    def _window_span_seconds(self, now_ns: int) -> float:
        """Return seconds elapsed from the oldest gaze sample to *now_ns*."""
        if not self._gaze_samples:
            return 0.0
        return (now_ns - self._gaze_samples[0].timestamp_ns) / _NS_PER_SECOND


# ── Pure helper functions ───────────────────────────────────────────────────


def _compute_gaze_direction(landmarks: np.ndarray) -> np.ndarray:
    """Derive a normalised 2-D gaze vector from iris and eye-corner positions.

    For each eye the iris centre is located relative to the outer and inner
    corners, yielding a ratio in ``[0, 1]`` for the horizontal (x) and
    vertical (y) axes.  The two eyes are averaged for a single gaze
    direction.

    Parameters
    ----------
    landmarks : np.ndarray
        Full landmark array of shape ``(478, 3)``.

    Returns
    -------
    np.ndarray
        2-D gaze vector ``[x, y]`` in ``[0, 1]`` normalised coordinates.
    """
    # Left eye.
    left_iris_centre = landmarks[LEFT_IRIS[0]]          # index 468
    left_outer = landmarks[LEFT_EYE_OUTER_CORNER]       # index 33
    left_inner = landmarks[LEFT_EYE_INNER_CORNER]       # index 133

    left_gaze_x, left_gaze_y = _iris_ratio(
        left_iris_centre, left_outer, left_inner
    )

    # Right eye.
    right_iris_centre = landmarks[RIGHT_IRIS[0]]        # index 473
    right_inner = landmarks[RIGHT_EYE_INNER_CORNER]     # index 362
    right_outer = landmarks[RIGHT_EYE_OUTER_CORNER]     # index 263

    right_gaze_x, right_gaze_y = _iris_ratio(
        right_iris_centre, right_inner, right_outer
    )

    # Average both eyes.
    gaze_x = (left_gaze_x + right_gaze_x) / 2.0
    gaze_y = (left_gaze_y + right_gaze_y) / 2.0

    return np.array([gaze_x, gaze_y], dtype=np.float64)


def _iris_ratio(
    iris: np.ndarray,
    corner_a: np.ndarray,
    corner_b: np.ndarray,
) -> tuple[float, float]:
    """Compute the normalised position of *iris* between two eye corners.

    Parameters
    ----------
    iris : np.ndarray
        3-D iris centre landmark.
    corner_a, corner_b : np.ndarray
        3-D eye corner landmarks defining the horizontal extent.

    Returns
    -------
    x_ratio, y_ratio : float
        Position of the iris as a fraction of the eye width / height,
        clamped to ``[0, 1]``.
    """
    eye_vec = corner_b - corner_a
    eye_len = float(np.linalg.norm(eye_vec[:2]))  # use x, y only
    if eye_len < 1e-8:
        return 0.5, 0.5

    iris_vec = iris - corner_a

    # Project onto the eye axis for x.
    x_ratio = float(np.dot(iris_vec[:2], eye_vec[:2])) / (eye_len * eye_len)
    x_ratio = max(0.0, min(1.0, x_ratio))

    # Perpendicular component for y (positive = down in image coords).
    perp = np.array([-eye_vec[1], eye_vec[0]], dtype=np.float64)
    perp_len = float(np.linalg.norm(perp))
    if perp_len < 1e-8:
        y_ratio = 0.5
    else:
        y_proj = float(np.dot(iris_vec[:2], perp)) / (perp_len * eye_len)
        y_ratio = max(0.0, min(1.0, 0.5 + y_proj))

    return x_ratio, y_ratio


def _prune_deque(dq: deque, cutoff_ns: int) -> None:
    """Remove entries with ``timestamp_ns`` older than *cutoff_ns*."""
    while dq and dq[0].timestamp_ns < cutoff_ns:
        dq.popleft()
