"""Alert manager — receives fatigue reports and delivers user notifications.

This is a *terminal* processor: it subscribes to ``Channel.FATIGUE_REPORT``
but does not publish to any output channel.  When a report's
``should_alert`` flag is set it:

* Logs the alert message at WARNING level.
* Sends a native macOS notification via ``osascript``.
* Prints a formatted console summary.

A periodic status line (every 30 s) is also emitted so operators know the
system is alive and can eyeball current scores.
"""

from __future__ import annotations

import asyncio
import logging
import subprocess
import sys
import time

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.messages import (
    Channel,
    FatigueReport,
    StampedMessage,
)

logger = logging.getLogger(__name__)

_STATUS_INTERVAL_S: float = 30.0  # periodic status log cadence


class AlertManager(BaseProcessor):
    """Delivers fatigue alerts via console output and OS notifications.

    Parameters
    ----------
    broker : MessageBroker
        Shared message broker.
    """

    def __init__(self, broker: MessageBroker) -> None:
        super().__init__(
            broker,
            input_channels=Channel.FATIGUE_REPORT,
            output_channel=None,
            name="AlertManager",
        )
        self._last_status_time: float = 0.0
        self._last_report: FatigueReport | None = None

    # ── BaseProcessor interface ─────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> None:
        """Handle an incoming fatigue report."""
        report: FatigueReport = msg.payload  # type: ignore[assignment]
        self._last_report = report

        # --- Fire alert if flagged ---
        if report.should_alert:
            self._deliver_alert(report)

        # --- Periodic status summary ---
        now = time.monotonic()
        if (now - self._last_status_time) >= _STATUS_INTERVAL_S:
            self._log_status(report)
            self._last_status_time = now

        # Terminal processor — never publish.
        return None

    # ── Alert delivery ──────────────────────────────────────────────────

    def _deliver_alert(self, report: FatigueReport) -> None:
        """Log, print, and push a native notification for the alert."""
        logger.warning("🚨 ALERT: %s", report.alert_message)

        # Formatted console banner.
        banner = (
            "\n"
            "╔══════════════════════════════════════════════════════════╗\n"
            "║                  ⚠️  FATIGUE ALERT  ⚠️                  ║\n"
            "╠══════════════════════════════════════════════════════════╣\n"
            f"║  Fatigue :  {report.fatigue_score:5.1%}                              ║\n"
            f"║  Attention: {report.attention_score:5.1%}                              ║\n"
            "╠══════════════════════════════════════════════════════════╣\n"
            f"║  {report.alert_message[:54]:<54} ║\n"
            "╚══════════════════════════════════════════════════════════╝"
        )
        print(banner, file=sys.stderr, flush=True)

        # macOS native notification (best-effort, non-blocking).
        self._send_macos_notification(
            title="Fatigue Tracker Alert",
            message=report.alert_message,
        )

    @staticmethod
    def _send_macos_notification(title: str, message: str) -> None:
        """Push a native macOS notification via ``osascript``.

        Runs in a fire-and-forget subprocess so it never blocks the
        event loop.  Silently ignores errors on non-macOS platforms.
        """
        if sys.platform != "darwin":
            return

        # Escape double-quotes for AppleScript string literals.
        safe_title = title.replace('"', '\\"')
        safe_message = message.replace('"', '\\"')

        script = (
            f'display notification "{safe_message}" '
            f'with title "{safe_title}" '
            f'sound name "Glass"'
        )
        try:
            subprocess.Popen(
                ["osascript", "-e", script],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except FileNotFoundError:
            logger.debug("osascript not found — skipping native notification")
        except Exception:
            logger.debug("Failed to send macOS notification", exc_info=True)

    # ── Status logging ──────────────────────────────────────────────────

    @staticmethod
    def _log_status(report: FatigueReport) -> None:
        """Emit a compact status line with current scores."""
        top_components = sorted(
            report.components.items(),
            key=lambda kv: abs(kv[1]),
            reverse=True,
        )[:3]
        details = ", ".join(f"{k}={v:.2f}" for k, v in top_components)
        logger.info(
            "📊 Status — fatigue=%.1f%%  attention=%.1f%%  [%s]",
            report.fatigue_score * 100,
            report.attention_score * 100,
            details,
        )
