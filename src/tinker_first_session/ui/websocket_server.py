"""WebSocket server — streams live FatigueReport data to the frontend.

The frontend (web app, dashboard, etc.) connects to::

    ws://localhost:8765

and receives a JSON payload on every update::

    {
        "fatigue_score": 0.72,
        "attention_score": 0.31,
        "should_alert": true,
        "alert_message": "Your eyes have been closed frequently...",
        "components": {
            "perclos": 0.80,
            "yawn": 0.65,
            "blink_rate_deviation": 0.10,
            "head_nodding": 0.20,
            "fixation_zoneout": 0.40,
            "gaze_entropy_quality": 0.55,
            "saccade_rate_quality": 0.72,
            "head_stability": 0.30,
            "blink_regularity": 0.80,
            "tension_engagement": 0.50
        }
    }

Design
------
* Subscribes to ``Channel.FATIGUE_REPORT`` on the shared broker.
* Runs the WebSocket server and the broker-listener as two concurrent
  ``asyncio`` tasks under a single ``BaseProcessor`` lifecycle.
* Broadcasts to **all** currently connected clients simultaneously
  (fan-out via ``asyncio.gather``).
* If no clients are connected the message is simply dropped — the broker
  queue is still drained so backpressure never builds up.
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from typing import Any

try:
    import websockets
    from websockets.legacy.server import WebSocketServerProtocol
    _HAS_WEBSOCKETS = True
except ImportError:
    _HAS_WEBSOCKETS = False

from tinker_first_session.core.base_processor import BaseProcessor
from tinker_first_session.core.broker import MessageBroker
from tinker_first_session.core.messages import Channel, FatigueReport, StampedMessage

logger = logging.getLogger(__name__)

_DEFAULT_HOST = "localhost"
_DEFAULT_PORT = 8765


class WebSocketServer(BaseProcessor):
    """Streams ``FatigueReport`` payloads to WebSocket clients as JSON.

    Parameters
    ----------
    broker : MessageBroker
        Shared message broker.
    host : str
        Interface to bind on. Defaults to ``localhost``.
    port : int
        Port to listen on. Defaults to ``8765``.
    """

    def __init__(
        self,
        broker: MessageBroker,
        host: str = _DEFAULT_HOST,
        port: int = _DEFAULT_PORT,
    ) -> None:
        if not _HAS_WEBSOCKETS:
            raise RuntimeError(
                "The 'websockets' package is required. "
                "Run: uv add websockets"
            )

        super().__init__(
            broker,
            input_channels=Channel.FATIGUE_REPORT,
            output_channel=None,
            name="WebSocketServer",
        )
        self._host = host
        self._port = port
        # Set of all currently connected WebSocket clients.
        self._clients: set[Any] = set()
        self._server: Any | None = None

    # ── BaseProcessor setup / teardown ──────────────────────────────────

    async def setup(self) -> None:
        """Start the WebSocket server before entering the run-loop."""
        self._server = await websockets.serve(  # type: ignore[attr-defined]
            self._on_client_connect,
            self._host,
            self._port,
        )
        logger.info(
            "WebSocketServer listening on ws://%s:%d  "
            "(frontend can connect here)",
            self._host,
            self._port,
        )

    async def teardown(self) -> None:
        """Stop the WebSocket server and close all client connections."""
        if self._server is not None:
            self._server.close()
            await self._server.wait_closed()
            logger.info("WebSocketServer stopped")

    # ── Incoming broker message ─────────────────────────────────────────

    async def process(self, msg: StampedMessage) -> None:
        """Receive a FatigueReport and broadcast it to all WebSocket clients."""
        report: FatigueReport = msg.payload  # type: ignore[assignment]

        if not self._clients:
            return  # No clients connected — nothing to send.

        payload = json.dumps(report.to_dict())
        await self._broadcast(payload)

    # ── WebSocket client management ─────────────────────────────────────

    async def _on_client_connect(self, websocket: Any, path: str = "/") -> None:
        """Handle a new WebSocket connection."""
        client_id = websocket.remote_address
        self._clients.add(websocket)
        logger.info("WebSocket client connected: %s  (total: %d)",
                    client_id, len(self._clients))
        try:
            # Send a handshake greeting so the client knows it's live.
            await websocket.send(json.dumps({"status": "connected", "channel": "fatigue_report"}))
            # Keep the connection alive until the client disconnects.
            await websocket.wait_closed()
        finally:
            self._clients.discard(websocket)
            logger.info("WebSocket client disconnected: %s  (total: %d)",
                        client_id, len(self._clients))

    async def _broadcast(self, payload: str) -> None:
        """Send *payload* to every connected client concurrently."""
        if not self._clients:
            return
        results = await asyncio.gather(
            *[client.send(payload) for client in self._clients],
            return_exceptions=True,
        )
        # Remove any clients that errored (closed mid-send).
        for client, result in zip(list(self._clients), results):
            if isinstance(result, Exception):
                logger.debug("Client send failed — removing: %s", result)
                self._clients.discard(client)
