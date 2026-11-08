"""In-process async pub/sub message broker with per-subscriber backpressure.

Design goals
------------
* **Sub-millisecond dispatch** — ``queue.put_nowait`` with Python objects
  passed by reference (no serialization).
* **Backpressure per subscriber** — bounded ``asyncio.Queue`` per consumer.
  When a slow processor falls behind, the *oldest* unread frame for that
  subscriber is silently dropped so it always works on the freshest data.
* **Zero external dependencies** — no Redis, no RabbitMQ.
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict

from tinker_first_session.core.messages import Channel, StampedMessage

logger = logging.getLogger(__name__)


class MessageBroker:
    """Fan-out pub/sub broker for the fatigue-tracking pipeline.

    Parameters
    ----------
    max_queue_size : int
        Maximum number of unread messages per subscriber queue.
        When a queue is full the oldest message is discarded.
    """

    def __init__(self, max_queue_size: int = 30) -> None:
        self._seq: int = 0
        self._subscribers: dict[Channel, list[asyncio.Queue[StampedMessage]]] = (
            defaultdict(list)
        )
        self._max_queue_size = max_queue_size
        self._dropped: dict[Channel, int] = defaultdict(int)

    # ── public API ──────────────────────────────────────────────────────

    def subscribe(self, channel: Channel) -> asyncio.Queue[StampedMessage]:
        """Register a consumer on *channel* and return its dedicated queue.

        The returned queue is bounded to ``max_queue_size``.  Consumers
        should ``await queue.get()`` in their run-loop.
        """
        queue: asyncio.Queue[StampedMessage] = asyncio.Queue(
            maxsize=self._max_queue_size,
        )
        self._subscribers[channel].append(queue)
        logger.debug("New subscriber on %s (total: %d)",
                      channel.name, len(self._subscribers[channel]))
        return queue

    def publish(self, channel: Channel, payload: object) -> StampedMessage:
        """Stamp, wrap, and fan out *payload* to every subscriber on *channel*.

        Returns the stamped message (useful for logging / testing).
        """
        self._seq += 1
        msg = StampedMessage(
            seq=self._seq,
            timestamp=time.monotonic_ns(),
            wall_clock=time.time(),
            channel=channel,
            payload=payload,
        )

        for queue in self._subscribers[channel]:
            if queue.full():
                try:
                    queue.get_nowait()  # drop oldest → backpressure
                    self._dropped[channel] += 1
                except asyncio.QueueEmpty:
                    pass
            try:
                queue.put_nowait(msg)
            except asyncio.QueueFull:
                # Shouldn't happen after the get_nowait above, but be safe.
                self._dropped[channel] += 1

        return msg

    # ── diagnostics ─────────────────────────────────────────────────────

    @property
    def total_published(self) -> int:
        """Total number of messages published (across all channels)."""
        return self._seq

    def dropped_count(self, channel: Channel) -> int:
        """Number of messages dropped on *channel* due to backpressure."""
        return self._dropped[channel]

    def subscriber_count(self, channel: Channel) -> int:
        """Number of subscribers currently registered on *channel*."""
        return len(self._subscribers[channel])

    def stats(self) -> dict[str, object]:
        """Return a snapshot of broker statistics for debugging."""
        return {
            "total_published": self._seq,
            "subscribers": {
                ch.name: len(subs)
                for ch, subs in self._subscribers.items()
            },
            "dropped": {
                ch.name: count
                for ch, count in self._dropped.items()
                if count > 0
            },
        }
