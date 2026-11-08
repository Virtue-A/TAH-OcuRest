"""Abstract base class for all pipeline processors.

Every processor in the pipeline follows the same lifecycle:

1.  **Subscribe** to one or more input channels on the broker.
2.  **Run** an async loop: await a message → process it → publish results.
3.  **Stop** gracefully when cancelled.

Concrete processors only need to implement :meth:`process`.
"""

from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod

from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.messages import Channel, StampedMessage

logger = logging.getLogger(__name__)


class BaseProcessor(ABC):
    """Base class that all pipeline processors inherit from.

    Parameters
    ----------
    broker : MessageBroker
        The shared message broker.
    input_channels : Channel | list[Channel]
        Channel(s) to subscribe to.
    output_channel : Channel | None
        Channel to publish processed results on.  ``None`` for terminal
        processors that don't emit messages (e.g., alert manager).
    name : str | None
        Human-readable name for logging.  Defaults to the class name.
    """

    def __init__(
        self,
        broker: MessageBroker,
        input_channels: Channel | list[Channel],
        output_channel: Channel | None = None,
        *,
        name: str | None = None,
    ) -> None:
        self.broker = broker
        self.output_channel = output_channel
        self.name = name or self.__class__.__name__
        self._task: asyncio.Task | None = None

        # Normalise to a list and subscribe.
        if isinstance(input_channels, Channel):
            input_channels = [input_channels]
        self._input_channels = input_channels
        self._queues: list[asyncio.Queue[StampedMessage]] = [
            broker.subscribe(ch) for ch in input_channels
        ]

    # ── abstract interface ──────────────────────────────────────────────

    @abstractmethod
    async def process(self, msg: StampedMessage) -> object | None:
        """Process a single incoming message.

        Return a payload to publish on ``output_channel``, or ``None`` to
        skip publishing for this frame (e.g., not enough data yet).
        """

    # ── lifecycle ───────────────────────────────────────────────────────

    async def setup(self) -> None:
        """Optional one-time initialisation (called before the run-loop)."""

    async def teardown(self) -> None:
        """Optional cleanup (called after the run-loop exits)."""

    def start(self) -> asyncio.Task:
        """Launch the processor's run-loop as an ``asyncio.Task``."""
        self._task = asyncio.create_task(self._run(), name=self.name)
        logger.info("%s started", self.name)
        return self._task

    async def stop(self) -> None:
        """Cancel the run-loop task and wait for it to finish."""
        if self._task is not None and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            logger.info("%s stopped", self.name)

    # ── internals ───────────────────────────────────────────────────────

    async def _run(self) -> None:
        """Main run-loop: dequeue → process → publish."""
        await self.setup()
        try:
            while True:
                # If we have a single input channel, just await it directly.
                # For multi-channel, we use asyncio.wait on all queues.
                if len(self._queues) == 1:
                    msg = await self._queues[0].get()
                    await self._handle(msg)
                else:
                    # Create get-tasks for every queue, await the first one
                    # that delivers, then re-arm.
                    pending: dict[asyncio.Task, int] = {}
                    try:
                        for i, q in enumerate(self._queues):
                            t = asyncio.create_task(q.get())
                            pending[t] = i

                        while pending:
                            done, _ = await asyncio.wait(
                                pending.keys(),
                                return_when=asyncio.FIRST_COMPLETED,
                            )
                            for task in done:
                                msg = task.result()
                                await self._handle(msg)
                                # Re-arm this queue.
                                idx = pending.pop(task)
                                new_task = asyncio.create_task(
                                    self._queues[idx].get()
                                )
                                pending[new_task] = idx
                    finally:
                        for task in pending:
                            task.cancel()
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Unhandled error in %s", self.name)
            raise
        finally:
            await self.teardown()

    async def _handle(self, msg: StampedMessage) -> None:
        """Process a message and optionally publish the result."""
        result = await self.process(msg)
        if result is not None and self.output_channel is not None:
            self.broker.publish(self.output_channel, result)
