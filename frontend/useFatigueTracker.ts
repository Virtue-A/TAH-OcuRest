import { useEffect, useRef, useState } from "react";

export type FatigueComponents = {
  perclos?: number;
  yawn?: number;
  blink_rate_deviation?: number;
  head_nodding?: number;
  fixation_zoneout?: number;
  gaze_entropy_quality?: number;
  saccade_rate_quality?: number;
  head_stability?: number;
  blink_regularity?: number;
  tension_engagement?: number;
  [key: string]: number | undefined;
};

export type FatigueReport = {
  fatigue_score: number;
  attention_score: number;
  should_alert: boolean;
  alert_message: string;
  components: FatigueComponents;
  timestamp?: number;
};

export function useFatigueTracker(url: string = "ws://localhost:8765") {
  const [connected, setConnected] = useState(false);
  const [report, setReport] = useState<FatigueReport | null>(null);
  const [lastAlert, setLastAlert] = useState<{ message: string; timestamp: number } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: number | null = null;
    let isDisposed = false;

    function connect() {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) return;
          setConnected(true);
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const data = JSON.parse(event.data);
            if (data && typeof data.fatigue_score === "number") {
              const parsedReport: FatigueReport = {
                ...data,
                timestamp: Date.now(),
              };
              setReport(parsedReport);
              if (parsedReport.should_alert && parsedReport.alert_message) {
                setLastAlert({
                  message: parsedReport.alert_message,
                  timestamp: Date.now(),
                });
              }
            }
          } catch (err) {
            console.debug("Non-JSON or invalid WS message:", event.data);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          setConnected(false);
          reconnectTimer = window.setTimeout(connect, 2500);
        };

        ws.onerror = () => {
          // Will trigger onclose and attempt reconnect
        };
      } catch (e) {
        if (!isDisposed) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  return { connected, report, lastAlert };
}
