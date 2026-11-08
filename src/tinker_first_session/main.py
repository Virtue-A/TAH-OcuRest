"""Entry point for the Student Fatigue & Awareness Tracker.

Wires every processor in the pipeline together, starts the async event
loop, and handles graceful shutdown on SIGINT / SIGTERM.

Pipeline topology::

    CameraProcessor
         │
         └─► FACE_LANDMARKS
              ├─► SaccadeProcessor    ──► BLINK_METRICS ─┐
              ├─► EyeMovementProcessor──► GAZE_METRICS  ─┤
              └─► FacialMovementProc  ──► FACIAL_METRICS ─┤
                                                          ▼
                                              MLHeuristicModel
                                                     │
                                                     └─► FATIGUE_REPORT
                                                          └─► AlertManager
"""

from __future__ import annotations

import asyncio
import logging
import signal
import sys

from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.capture.camera_processor import CameraProcessor
from tinker_first_session.processors.saccade_processor import SaccadeProcessor
from tinker_first_session.processors.eye_movement_processor import EyeMovementProcessor
from tinker_first_session.processors.facial_movement_processor import FacialMovementProcessor
from tinker_first_session.model.heuristic_model import MLHeuristicModel
from tinker_first_session.ui.alert_manager import AlertManager

logger = logging.getLogger(__name__)


def _configure_logging() -> None:
    """Set up root logging with a human-friendly format."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stderr,
    )


async def main() -> None:
    """Initialise the full pipeline and run until interrupted."""
    _configure_logging()
    logger.info("Starting Student Fatigue & Awareness Tracker …")

    # ── Shared message broker ───────────────────────────────────────────
    broker = MessageBroker()

    # ── Create processors (order matters for shutdown) ──────────────────
    camera = CameraProcessor(broker)
    saccade = SaccadeProcessor(broker)
    eye_movement = EyeMovementProcessor(broker)
    facial_movement = FacialMovementProcessor(broker)
    heuristic = MLHeuristicModel(broker)
    alert_mgr = AlertManager(broker)

    # Ordered list of BaseProcessor instances (camera is handled separately).
    async_processors = [saccade, eye_movement, facial_movement, heuristic, alert_mgr]

    # ── Start all processors ────────────────────────────────────────────
    # CameraProcessor.start() is a coroutine that returns a Task.
    # BaseProcessor.start() is synchronous and returns a Task directly.
    tasks: list[asyncio.Task] = []
    tasks.append(await camera.start())
    for proc in [saccade, eye_movement, facial_movement, heuristic, alert_mgr]:
        tasks.append(proc.start())

    logger.info(
        "All processors running. Press Ctrl+C to stop.",
    )

    # ── Graceful shutdown ───────────────────────────────────────────────
    shutdown_event = asyncio.Event()

    def _signal_handler(sig: signal.Signals, _frame: object) -> None:
        signame = signal.Signals(sig).name
        logger.info("Received %s — initiating graceful shutdown …", signame)
        shutdown_event.set()

    # Register signal handlers (only works on the main thread).
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            signal.signal(sig, _signal_handler)
        except (OSError, ValueError):
            # signal.signal can raise ValueError if not on the main thread.
            pass

    # Wait until a shutdown signal fires.
    await shutdown_event.wait()

    # ── Tear down in reverse order (camera first, then reverse) ─────────
    logger.info("Stopping camera …")
    await camera.stop()

    for proc in reversed(async_processors):
        logger.info("Stopping %s …", proc.name)
        await proc.stop()

    # ── Final diagnostics ───────────────────────────────────────────────
    stats = broker.stats()
    logger.info("Broker stats: %s", stats)
    logger.info("Shutdown complete. Goodbye! 👋")


def run() -> None:
    """CLI entry point (referenced by ``pyproject.toml`` ``[project.scripts]``)."""
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # asyncio.run may surface KeyboardInterrupt after the loop stops.
        pass
