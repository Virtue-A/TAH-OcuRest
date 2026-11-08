"""Data contracts for every message flowing through the broker.

All payloads are frozen (immutable) dataclasses with __slots__ for
memory efficiency.  Processors never need to touch raw MediaPipe types.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from enum import Enum, auto

import numpy as np


# ── Channels ────────────────────────────────────────────────────────────────

class Channel(Enum):
    """Named pub/sub channels."""

    FACE_LANDMARKS = auto()   # CameraProcessor  → broker → processors
    BLINK_METRICS  = auto()   # SaccadeProcessor  → broker → heuristic
    GAZE_METRICS   = auto()   # EyeMovementProcessor → broker → heuristic
    FACIAL_METRICS = auto()   # FacialMovementProcessor → broker → heuristic
    FATIGUE_REPORT = auto()   # HeuristicModel   → broker → UI / alerts


# ── Envelope ────────────────────────────────────────────────────────────────

@dataclass(frozen=True, slots=True)
class StampedMessage:
    """Universal message envelope wrapping every payload on every channel.

    Parameters
    ----------
    seq : int
        Monotonically increasing frame counter (set by the broker).
    timestamp : int
        ``time.monotonic_ns()`` captured at publish time — use for all
        duration calculations (blink length, fixation time, rolling windows).
    wall_clock : float
        ``time.time()`` — only for human-readable logging / UI display.
    channel : Channel
        Which channel this message was published on.
    payload : object
        One of the typed dataclasses below, depending on *channel*.
    """

    seq: int
    timestamp: int
    wall_clock: float
    channel: Channel
    payload: object


# ── Payloads ────────────────────────────────────────────────────────────────

@dataclass(frozen=True, slots=True)
class FaceLandmarks:
    """Standardised face data extracted from MediaPipe FaceMesh.

    All coordinates are normalised to [0, 1] relative to the frame.
    """

    landmarks: np.ndarray
    """Full landmark array, shape ``(478, 3)`` float32."""

    iris_left: np.ndarray
    """Left iris landmarks, shape ``(5, 3)`` — centre + 4 boundary."""

    iris_right: np.ndarray
    """Right iris landmarks, shape ``(5, 3)``."""

    face_bbox: tuple[float, float, float, float]
    """Bounding box ``(x, y, w, h)`` normalised."""

    detection_confidence: float
    """FaceMesh detection confidence in ``[0, 1]``."""

    image_width: int
    """Original frame width in pixels (needed for solvePnP)."""

    image_height: int
    """Original frame height in pixels."""


@dataclass(frozen=True, slots=True)
class BlinkMetrics:
    """Output of :class:`SaccadeProcessor` — blink pattern analysis."""

    ear_left: float
    """Eye Aspect Ratio for the left eye."""

    ear_right: float
    """Eye Aspect Ratio for the right eye."""

    ear_avg: float
    """Average of left and right EAR."""

    is_blink: bool
    """``True`` during a detected blink event."""

    blink_duration_ms: float
    """Duration of the current blink in ms (0 if not blinking)."""

    blinks_per_minute: float
    """Rolling-window blink rate."""

    perclos: float
    """Percentage of time eyes ≥80 % closed over the last 60 s."""


@dataclass(frozen=True, slots=True)
class GazeMetrics:
    """Output of :class:`EyeMovementProcessor` — gaze & saccade analysis."""

    gaze_direction: np.ndarray
    """Normalised 2-D gaze vector ``(x, y)``."""

    saccade_velocity: float
    """Instantaneous saccade velocity in normalised units / s."""

    fixation_duration_ms: float
    """How long the gaze has stayed within a small radius."""

    saccade_count_per_minute: float
    """Rolling-window saccade rate."""

    gaze_entropy: float
    """Spatial Shannon entropy of gaze distribution over a grid."""


@dataclass(frozen=True, slots=True)
class FacialMetrics:
    """Output of :class:`FacialMovementProcessor` — head pose & tension."""

    jaw_openness: float
    """Normalised jaw opening ``[0, 1]`` — used for yawn detection."""

    brow_raise: float
    """Normalised brow elevation ``[0, 1]``."""

    head_pitch: float
    """Head pitch (nodding) in degrees."""

    head_yaw: float
    """Head yaw (turning) in degrees."""

    head_roll: float
    """Head roll in degrees."""

    mouth_aspect_ratio: float
    """MAR — analogous to EAR but for the mouth (yawn detection)."""

    micro_expression_tension: float
    """Composite facial tension score ``[0, 1]``."""


@dataclass(frozen=True, slots=True)
class FatigueReport:
    """Output of :class:`MLHeuristicModel` — fused fatigue & attention."""

    fatigue_score: float
    """Overall fatigue score ``[0, 1]``.  Higher = more fatigued."""

    attention_score: float
    """Overall attention score ``[0, 1]``.  Higher = more attentive."""

    should_alert: bool
    """``True`` when scores cross the alert threshold."""

    alert_message: str
    """Human-readable suggestion (empty string if no alert)."""

    components: dict[str, float]
    """Breakdown of contributing signals for debugging / UI."""

    def to_dict(self) -> dict:
        """Serialize to a JSON-safe dictionary for WebSocket / HTTP delivery.

        The returned dict is flat and human-readable so the frontend can
        consume it without any extra transformation::

            {
                "fatigue_score": 0.72,
                "attention_score": 0.31,
                "should_alert": true,
                "alert_message": "...",
                "components": {
                    "perclos": 0.80,
                    "yawn": 0.65,
                    ...
                }
            }
        """
        return {
            "fatigue_score": self.fatigue_score,
            "attention_score": self.attention_score,
            "should_alert": self.should_alert,
            "alert_message": self.alert_message,
            "components": dict(self.components),
        }
