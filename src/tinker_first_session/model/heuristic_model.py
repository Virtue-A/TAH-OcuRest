"""Heuristic fusion model — combines blink, gaze, and facial metrics into
fatigue and attention scores.

The model subscribes to the three mid-level processor channels and maintains
*last-known* values for each metric type.  Every incoming message triggers a
full re-fusion so that scores stay responsive even when processors run at
different frame-rates.

Fatigue score (0 → 1, higher = more fatigued)
    PERCLOS (0.35) · blink-rate deviation (0.15) · yawn (0.20)
    head nodding (0.15) · long fixation (0.15)

Attention score (0 → 1, higher = more attentive)
    gaze entropy (0.30) · saccade rate (0.20) · head-pose stability (0.25)
    blink regularity (0.15) · micro-expression tension (0.10)
"""

from __future__ import annotations

import logging
import time
from collections import deque

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.messages import (
    BlinkMetrics,
    Channel,
    FacialMetrics,
    FatigueReport,
    GazeMetrics,
    StampedMessage,
)

logger = logging.getLogger(__name__)

# ── Alert cooldown ──────────────────────────────────────────────────────────

_ALERT_COOLDOWN_S: float = 5 * 60  # 5 minutes between successive alerts

# ── Fatigue component weights ──────────────────────────────────────────────

_W_PERCLOS: float = 0.35
_W_BLINK_RATE_DEV: float = 0.15
_W_YAWN: float = 0.20
_W_HEAD_NOD: float = 0.15
_W_FIXATION: float = 0.15

# ── Attention component weights ────────────────────────────────────────────

_W_GAZE_ENTROPY: float = 0.30
_W_SACCADE_RATE: float = 0.20
_W_HEAD_STABILITY: float = 0.25
_W_BLINK_REGULARITY: float = 0.15
_W_MICRO_TENSION: float = 0.10

# ── Thresholds ─────────────────────────────────────────────────────────────

_FATIGUE_ALERT_THRESHOLD: float = 0.65
_ATTENTION_ALERT_THRESHOLD: float = 0.35

# Normal blink-rate band (blinks/min)
_BLINK_RATE_LOW: float = 10.0
_BLINK_RATE_HIGH: float = 25.0
_BLINK_RATE_NORMAL: float = 17.5  # midpoint

# Normal saccade rate (saccades/min) — ~3–4 per second
_SACCADE_NORMAL_LOW: float = 150.0
_SACCADE_NORMAL_HIGH: float = 260.0

# Head-pitch variance window for nodding detection (last N pitches)
_PITCH_HISTORY_SIZE: int = 30


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp *value* to [lo, hi]."""
    return max(lo, min(hi, value))


class MLHeuristicModel(BaseProcessor):
    """Fuses blink, gaze, and facial metrics into a unified fatigue report.

    This is a *running-fusion* model: every incoming message on any of the
    three input channels triggers re-computation using the most recent
    values from all three sources.

    Parameters
    ----------
    broker : MessageBroker
        Shared message broker.
    """

    def __init__(self, broker: MessageBroker) -> None:
        super().__init__(
            broker,
            input_channels=[
                Channel.BLINK_METRICS,
                Channel.GAZE_METRICS,
                Channel.FACIAL_METRICS,
            ],
            output_channel=Channel.FATIGUE_REPORT,
            name="MLHeuristicModel",
        )

        # Last-known metric snapshots (updated independently).
        self._last_blink: BlinkMetrics | None = None
        self._last_gaze: GazeMetrics | None = None
        self._last_facial: FacialMetrics | None = None

        # Rolling head-pitch history for nodding variance.
        self._pitch_history: deque[float] = deque(maxlen=_PITCH_HISTORY_SIZE)

        # Alert cooldown tracking (monotonic seconds).
        self._last_alert_time: float = 0.0

    # ── BaseProcessor interface ─────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> FatigueReport | None:
        """Ingest a metric message, update last-known state, and fuse."""
        # Update the appropriate slot based on the channel.
        if msg.channel is Channel.BLINK_METRICS:
            self._last_blink = msg.payload  # type: ignore[assignment]
        elif msg.channel is Channel.GAZE_METRICS:
            self._last_gaze = msg.payload  # type: ignore[assignment]
        elif msg.channel is Channel.FACIAL_METRICS:
            self._last_facial = msg.payload  # type: ignore[assignment]
            # Track head pitch for nodding detection.
            self._pitch_history.append(self._last_facial.head_pitch)

        # We need at least one source to produce any useful output.
        if self._last_blink is None and self._last_gaze is None and self._last_facial is None:
            return None

        fatigue, fatigue_components = self._compute_fatigue()
        attention, attention_components = self._compute_attention()

        components = {**fatigue_components, **attention_components}

        should_alert, alert_message = self._evaluate_alert(
            fatigue, attention, fatigue_components, attention_components,
        )

        return FatigueReport(
            fatigue_score=round(fatigue, 4),
            attention_score=round(attention, 4),
            should_alert=should_alert,
            alert_message=alert_message,
            components={k: round(v, 4) for k, v in components.items()},
        )

    # ── Fatigue computation ─────────────────────────────────────────────

    def _compute_fatigue(self) -> tuple[float, dict[str, float]]:
        """Return ``(fatigue_score, component_dict)``."""
        components: dict[str, float] = {}

        # --- PERCLOS (0.35) ---
        perclos = self._last_blink.perclos if self._last_blink else 0.0
        # PERCLOS is already in [0, 1]; map linearly (>0.15 is drowsy).
        perclos_signal = _clamp(perclos / 0.30)  # saturates at 30 %
        components["perclos"] = perclos_signal

        # --- Blink-rate deviation (0.15) ---
        if self._last_blink:
            bpm = self._last_blink.blinks_per_minute
            if bpm < _BLINK_RATE_LOW:
                # Abnormally low — fatigue indicator.
                blink_dev = _clamp((_BLINK_RATE_LOW - bpm) / _BLINK_RATE_LOW)
            elif bpm > _BLINK_RATE_HIGH:
                # Abnormally high — also fatigue indicator.
                blink_dev = _clamp((bpm - _BLINK_RATE_HIGH) / _BLINK_RATE_HIGH)
            else:
                blink_dev = 0.0
        else:
            blink_dev = 0.0
        components["blink_rate_deviation"] = blink_dev

        # --- Yawn detection (0.20) ---
        if self._last_facial:
            jaw = self._last_facial.jaw_openness
            mar = self._last_facial.mouth_aspect_ratio
            yawn_signal = _clamp(max(jaw, mar) / 0.6)  # saturates at 0.6
        else:
            yawn_signal = 0.0
        components["yawn"] = yawn_signal

        # --- Head nodding (0.15) ---
        if len(self._pitch_history) >= 5:
            import statistics
            pitch_var = statistics.variance(self._pitch_history)
            # Normalise: variance > 25 deg² is heavy nodding.
            nod_signal = _clamp(pitch_var / 25.0)
        else:
            nod_signal = 0.0
        components["head_nodding"] = nod_signal

        # --- Long fixation / zoning out (0.15) ---
        if self._last_gaze:
            fix_ms = self._last_gaze.fixation_duration_ms
            # Fixations > 2 000 ms suggest zoning out.
            fixation_signal = _clamp((fix_ms - 500.0) / 1500.0)
        else:
            fixation_signal = 0.0
        components["fixation_zoneout"] = fixation_signal

        score = (
            _W_PERCLOS * perclos_signal
            + _W_BLINK_RATE_DEV * blink_dev
            + _W_YAWN * yawn_signal
            + _W_HEAD_NOD * nod_signal
            + _W_FIXATION * fixation_signal
        )
        return _clamp(score), components

    # ── Attention computation ───────────────────────────────────────────

    def _compute_attention(self) -> tuple[float, dict[str, float]]:
        """Return ``(attention_score, component_dict)``."""
        components: dict[str, float] = {}

        # --- Gaze entropy (0.30) ---
        # Moderate entropy (~2–3 bits) is ideal for reading.
        # Very low = staring, very high = erratic.
        if self._last_gaze:
            ent = self._last_gaze.gaze_entropy
            # Map to 0–1: peak at 2.5, drops off for <1 or >4.
            if ent < 2.5:
                entropy_good = _clamp(ent / 2.5)
            else:
                entropy_good = _clamp(1.0 - (ent - 2.5) / 2.5)
        else:
            entropy_good = 0.5  # neutral default
        components["gaze_entropy_quality"] = entropy_good

        # --- Saccade rate (0.20) ---
        if self._last_gaze:
            spm = self._last_gaze.saccade_count_per_minute
            if _SACCADE_NORMAL_LOW <= spm <= _SACCADE_NORMAL_HIGH:
                saccade_good = 1.0
            elif spm < _SACCADE_NORMAL_LOW:
                saccade_good = _clamp(spm / _SACCADE_NORMAL_LOW)
            else:
                saccade_good = _clamp(1.0 - (spm - _SACCADE_NORMAL_HIGH) / _SACCADE_NORMAL_HIGH)
        else:
            saccade_good = 0.5
        components["saccade_rate_quality"] = saccade_good

        # --- Head-pose stability (0.25) ---
        if self._last_facial:
            yaw_dev = abs(self._last_facial.head_yaw)
            roll_dev = abs(self._last_facial.head_roll)
            # Focused = looking forward: yaw < 10°, roll < 8°.
            yaw_score = _clamp(1.0 - yaw_dev / 30.0)
            roll_score = _clamp(1.0 - roll_dev / 25.0)
            head_stable = (yaw_score + roll_score) / 2.0
        else:
            head_stable = 0.5
        components["head_stability"] = head_stable

        # --- Blink regularity (0.15) ---
        # Regular blink intervals ≈ engaged.  We approximate by checking
        # whether blink rate is in the normal band (steady state).
        if self._last_blink:
            bpm = self._last_blink.blinks_per_minute
            if _BLINK_RATE_LOW <= bpm <= _BLINK_RATE_HIGH:
                blink_reg = 1.0
            else:
                deviation = min(
                    abs(bpm - _BLINK_RATE_LOW),
                    abs(bpm - _BLINK_RATE_HIGH),
                )
                blink_reg = _clamp(1.0 - deviation / 15.0)
        else:
            blink_reg = 0.5
        components["blink_regularity"] = blink_reg

        # --- Micro-expression tension (0.10) ---
        # Moderate tension (~0.3–0.5) = engaged; low = disengaged; high = stressed.
        if self._last_facial:
            t = self._last_facial.micro_expression_tension
            if t < 0.4:
                tension_good = _clamp(t / 0.4)
            else:
                tension_good = _clamp(1.0 - (t - 0.4) / 0.6)
        else:
            tension_good = 0.5
        components["tension_engagement"] = tension_good

        score = (
            _W_GAZE_ENTROPY * entropy_good
            + _W_SACCADE_RATE * saccade_good
            + _W_HEAD_STABILITY * head_stable
            + _W_BLINK_REGULARITY * blink_reg
            + _W_MICRO_TENSION * tension_good
        )
        return _clamp(score), components

    # ── Alert evaluation ────────────────────────────────────────────────

    def _evaluate_alert(
        self,
        fatigue: float,
        attention: float,
        fatigue_components: dict[str, float],
        attention_components: dict[str, float],
    ) -> tuple[bool, str]:
        """Decide whether to fire an alert and compose a contextual message.

        Returns ``(should_alert, alert_message)``.  Respects the cooldown
        window to avoid notification spam.
        """
        triggered = fatigue > _FATIGUE_ALERT_THRESHOLD or attention < _ATTENTION_ALERT_THRESHOLD

        if not triggered:
            return False, ""

        # Enforce cooldown.
        now = time.monotonic()
        if (now - self._last_alert_time) < _ALERT_COOLDOWN_S:
            return False, ""

        # Build a contextual message based on the dominant signals.
        reasons: list[str] = []

        if fatigue_components.get("perclos", 0) > 0.5:
            reasons.append("Your eyes have been closed frequently — you may be drowsy.")
        if fatigue_components.get("yawn", 0) > 0.5:
            reasons.append("Yawning detected — consider taking a break.")
        if fatigue_components.get("head_nodding", 0) > 0.5:
            reasons.append("Head nodding detected — signs of dozing off.")
        if fatigue_components.get("fixation_zoneout", 0) > 0.5:
            reasons.append("You've been staring at one spot for a while — try refocusing.")
        if fatigue_components.get("blink_rate_deviation", 0) > 0.5:
            reasons.append("Unusual blink pattern detected.")

        if attention_components.get("head_stability", 0) < 0.4:
            reasons.append("You seem to be looking away from the screen frequently.")
        if attention_components.get("gaze_entropy_quality", 0) < 0.3:
            reasons.append("Your gaze pattern suggests disengagement.")

        if not reasons:
            reasons.append("Your fatigue and attention levels suggest you need a break.")

        message = " ".join(reasons) + (
            f" (fatigue={fatigue:.0%}, attention={attention:.0%})"
        )

        self._last_alert_time = now
        logger.warning("FATIGUE ALERT: %s", message)

        return True, message
