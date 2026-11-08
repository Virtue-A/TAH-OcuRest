# OcuRest — Student Fatigue & Awareness Tracker

An intelligent, non-invasive study companion that tracks eye blinking, saccade patterns, gaze entropy, and facial movements via webcam to estimate cognitive fatigue and attention in real time. When signs of fatigue or drowsiness are detected, it delivers gentle, contextual reset reminders to help students study sustainably.

---

## Architecture Overview

```
                      ┌──────────────────────┐
                      │   🎥 System Webcam   │
                      └──────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │    CameraProcessor    │
                     │  (MediaPipe FaceMesh) │
                     └──────────┬────────────┘
                                │  Channel.FACE_LANDMARKS
                                ▼
                     ┌───────────────────────┐
                     │     MessageBroker     │  (In-process Async Pub/Sub)
                     └─────┬───────┬───────┬─┘
                           │       │       │
              ┌────────────┘       │       └────────────┐
              ▼                    ▼                    ▼
     ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐
     │ SaccadeProcessor│  │EyeMovementProc.  │  │FacialMovementProcessor│
     │  - EAR          │  │  - Gaze vector   │  │  - Head pose (PnP)    │
     │  - PERCLOS      │  │  - Gaze entropy  │  │  - Jaw / Yawn (MAR)   │
     │  - Blink Rate   │  │  - Saccade rate  │  │  - Muscle tension     │
     └────────┬────────┘  └────────┬─────────┘  └───────────┬───────────┘
              │                    │                        │
              └────────────┐       │       ┌────────────────┘
                           ▼       ▼       ▼
                     ┌───────────────────────────┐
                     │     MLHeuristicModel      │
                     │ (Multi-signal running-    │
                     │  fusion fatigue engine)   │
                     └─────────────┬─────────────┘
                                   │  Channel.FATIGUE_REPORT
                         ┌─────────┴─────────┐
                         ▼                   ▼
               ┌──────────────────┐  ┌───────────────────────┐
               │   AlertManager   │  │    WebSocketServer    │
               │ (Console & macOS │  │  (ws://localhost:8765)│
               │  Notifications)  │  └───────────┬───────────┘
               └──────────────────┘              │
                                                 ▼
                                     ┌───────────────────────┐
                                     │  React + Vite Frontend│
                                     │ (Live Telemetry & UI) │
                                     └───────────────────────┘
```

---

## Project Structure

```text
TAH-OcuRest/
├── src/tinker_first_session/        # Python ML Backend
│   ├── capture/                     # Webcam capture & MediaPipe FaceMesh
│   ├── core/                        # MessageBroker, BaseProcessor & data contracts
│   ├── processors/                  # Saccade, EyeMovement & FacialMovement processors
│   ├── model/                       # MLHeuristicModel running fusion
│   ├── ui/                          # AlertManager & WebSocketServer
│   └── main.py                      # Pipeline orchestration & lifecycle
├── frontend/                        # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/                         # Application components, styles & telemetry hooks
│   │   ├── App.tsx                  # Main interactive focus application
│   │   ├── useFatigueTracker.ts     # WebSocket telemetry client hook
│   │   └── main.tsx                 # React entrypoint
│   ├── package.json
│   └── vite.config.ts
├── pyproject.toml                   # Python dependencies & CLI entrypoints
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- **Python 3.12+** with [`uv`](https://docs.astral.sh/uv/) installed.
- **Node.js 20+** with `npm`.

---

### 2. Run the Python ML Backend

```bash
# Install Python dependencies and start the tracking pipeline
uv sync
uv run fatigue-tracker
```

*The backend will initialize your webcam, run facial landmark inference at 30 FPS, and open a WebSocket broadcaster on `ws://localhost:8765`.*

---

### 3. Run the React Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

*Open your browser at the URL shown (default: `http://localhost:8443` or `http://localhost:5173`).*

---

## Real-Time Features

- **Live AI Focus Signal**: Displays real-time focus state (`Steady`, `Sustained`, `Dipping`, `Fatigued`) and animated attention waveforms driven by actual computer vision metrics.
- **Biometric Indicators**:
  - **PERCLOS**: Percentage of eyelid closure over rolling 60-second windows.
  - **Gaze Entropy & Saccades**: Spatial dispersion of gaze points across a 5×5 grid.
  - **Yawn & Mouth Aspect Ratio (MAR)**: Distinguishes natural speech from fatigue yawning.
  - **Head Pose Estimation**: 3D orientation (pitch, yaw, roll) via perspective-n-point (`solvePnP`) to detect nodding off or looking away.
- **Smart Reminders**: Evaluates composite fatigue/attention thresholds with built-in cooldowns to prevent notification fatigue, providing actionable suggestions.
- **Privacy-First**: All computer vision processing happens 100% locally on-device. No video or biometric frames are stored or transmitted.
