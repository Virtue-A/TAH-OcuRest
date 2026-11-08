import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

type IconProps = { className?: string };

function EyeIcon({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.6 12s3.4-6 9.4-6 9.4 6 9.4 6-3.4 6-9.4 6-9.4-6-9.4-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CameraIcon({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 7.5h3l1.2-2h6.6l1.2 2h3A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V9a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function LumiMark({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.25C5 6.8 8.15 3 12 3s7 3.8 7 9.25c0 1.25-.7 2.25-1.8 2.25-.95 0-1.35-.8-1.85-.8-.45 0-.85.8-1.8.8s-1.1-.8-1.55-.8-.6.8-1.55.8-1.35-.8-1.85-.8c-.45 0-.9.8-1.8.8C5.7 14.5 5 13.5 5 12.25Z"
        fill="currentColor"
      />
      <circle cx="9.5" cy="10" r=".9" fill="var(--accent)" />
      <circle cx="14.5" cy="10" r=".9" fill="var(--accent)" />
      <path
        d="M8 15c-.6 2 .6 2.8 0 5M12 15c-.5 2 .5 2.8 0 5M16 15c.6 2-.6 2.8 0 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.8c.35 4.8 2.55 7 7.2 7.2-4.65.2-6.85 2.4-7.2 7.2-.35-4.8-2.55-7-7.2-7.2 4.65-.2 6.85-2.4 7.2-7.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 15.5c.12 1.75.85 2.5 2.5 2.6-1.65.1-2.38.85-2.5 2.6-.12-1.75-.85-2.5-2.5-2.6 1.65-.1 2.38-.85 2.5-2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon({ className = "size-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3.4v2M12 18.6v2M20.6 12h-2M5.4 12h-2M18.1 5.9l-1.4 1.4M7.3 16.7l-1.4 1.4M18.1 18.1l-1.4-1.4M7.3 7.3 5.9 5.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonJellyCompanion({ className = "size-16" }: IconProps) {
  return (
    <svg
      className={`pet-companion ${className}`}
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="48" cy="88" rx="22" ry="3.5" fill="var(--accent)" opacity=".1" />
      <path
        d="M18 51.5C18 29.7 31.45 14 48 14s30 15.7 30 37.5c0 4.6-2.85 8.5-7.5 8.5-4 0-5.75-3.15-7.5-3.15S59.25 60 55.25 60 49.75 56.85 48 56.85 44.75 60 40.75 60 35 56.85 33 56.85 29.5 60 25.5 60C20.85 60 18 56.1 18 51.5Z"
        fill="var(--soft)"
        fillOpacity=".88"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M28 47c1.4-15.6 9.25-24 20-24s18.6 8.4 20 24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M35 30c2.5-3.8 7.05-6 13-6"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity=".72"
      />
      <circle cx="39" cy="44" r="3.5" fill="var(--deep)" />
      <circle cx="57" cy="44" r="3.5" fill="var(--deep)" />
      <circle cx="40.2" cy="42.8" r="1.1" fill="white" />
      <circle cx="58.2" cy="42.8" r="1.1" fill="white" />
      <path
        d="M44.5 51c2.2 1.65 4.8 1.65 7 0"
        stroke="var(--deep)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M30 59c-2 8 4.5 10.5 1.5 19-1 2.85-3 4.5-5 6"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity=".8"
      />
      <path
        d="M42 59c-1.75 7.5 3.25 11 0 19-1 2.5-2.4 4-3.5 5.5"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity=".65"
      />
      <path
        d="M54 59c1.75 7.5-3.25 11 0 19 1 2.5 2.4 4 3.5 5.5"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity=".65"
      />
      <path
        d="M66 59c2 8-4.5 10.5-1.5 19 1 2.85 3 4.5 5 6"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity=".8"
      />
    </svg>
  );
}

const blinkSamples = [
  { label: "Steady", message: "Focus looks steady", slow: false },
  { label: "Sustained", message: "Sustained focus", slow: false },
  { label: "Dipping", message: "Focus may be dipping", slow: true },
  { label: "Reset soon", message: "A short reset may help", slow: true },
];

const weeklySamples = [
  { day: "Mon", focus: 68, breaks: 4 },
  { day: "Tue", focus: 82, breaks: 5 },
  { day: "Wed", focus: 74, breaks: 3 },
  { day: "Thu", focus: 96, breaks: 6 },
  { day: "Fri", focus: 88, breaks: 4 },
  { day: "Sat", focus: 42, breaks: 2 },
  { day: "Sun", focus: 55, breaks: 3 },
];

const colorThemes = {
  blue: {
    label: "Ocean",
    accent: "#47789f",
    deep: "#264d6b",
    ink: "#283946",
    soft: "#e7f0f6",
    muted: "#7c91a1",
    glow: "rgba(197, 222, 239, .64)",
  },
  green: {
    label: "Forest",
    accent: "#315442",
    deep: "#17352a",
    ink: "#17251f",
    soft: "#e3eadc",
    muted: "#798b82",
    glow: "rgba(207, 221, 195, .6)",
  },
  violet: {
    label: "Dusk",
    accent: "#655b8e",
    deep: "#3d365e",
    ink: "#29263a",
    soft: "#e8e3f2",
    muted: "#89829d",
    glow: "rgba(205, 194, 228, .55)",
  },
  amber: {
    label: "Clay",
    accent: "#956346",
    deep: "#573925",
    ink: "#34271f",
    soft: "#f0e2d6",
    muted: "#927d6e",
    glow: "rgba(232, 199, 171, .55)",
  },
  pink: {
    label: "Rose",
    accent: "#c9688f",
    deep: "#71374f",
    ink: "#472d38",
    soft: "#f5e4eb",
    muted: "#9a7e89",
    glow: "rgba(239, 190, 210, .58)",
  },
} as const;

type ThemeName = keyof typeof colorThemes;
type ColorMode = "light" | "dark";
type HabitatName = "clear" | "moonlit" | "tidepool" | "coral" | "kelp" | "starlight";
type AccessibilityPreferences = {
  textSize: "compact" | "default" | "large";
  highContrast: boolean;
  largerControls: boolean;
  reducedMotion: boolean;
};

const habitatLevels: Array<{
  id: HabitatName;
  label: string;
  points: number;
  description: string;
}> = [
  { id: "clear", label: "Clear water", points: 0, description: "A bright, open place to begin." },
  { id: "moonlit", label: "Moonlit sand", points: 20, description: "A quiet evening shoreline." },
  {
    id: "tidepool",
    label: "Tidepool room",
    points: 50,
    description: "Soft plants and sheltered water.",
  },
  {
    id: "coral",
    label: "Soft coral garden",
    points: 100,
    description: "Pink coral and warmer evening light.",
  },
  {
    id: "kelp",
    label: "Kelp observatory",
    points: 170,
    description: "Tall sea grass and a wide ocean window.",
  },
  {
    id: "starlight",
    label: "Starlight cove",
    points: 260,
    description: "A deep-blue cove lit by drifting stars.",
  },
];

function journeyState(points: number) {
  const unlockedIndex = habitatLevels.reduce(
    (current, habitat, index) => (points >= habitat.points ? index : current),
    0,
  );
  const current = habitatLevels[unlockedIndex];
  const next = habitatLevels[unlockedIndex + 1] ?? null;
  const progress = next
    ? Math.round(((points - current.points) / (next.points - current.points)) * 100)
    : 100;
  return { current, next, progress, level: unlockedIndex + 1 };
}
type StudySession = {
  id: string;
  title: string;
  time: string;
  duration: number;
  location: string;
  completed?: boolean;
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfWeek = (date: Date) => {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatTime = (time: string) =>
  new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
};

function getSavedTheme(): ThemeName {
  try {
    const savedTheme = window.localStorage.getItem("soft-focus-theme");
    return savedTheme && savedTheme in colorThemes ? (savedTheme as ThemeName) : "blue";
  } catch {
    return "blue";
  }
}

function getSavedMode(): ColorMode {
  try {
    return window.localStorage.getItem("soft-focus-mode") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getSavedCompanion(): boolean {
  try {
    return window.localStorage.getItem("ocurest-companion") !== "off";
  } catch {
    return true;
  }
}

function getSavedCompanionProgress(): number {
  try {
    const savedProgress = Number(window.localStorage.getItem("ocurest-companion-progress"));
    return Number.isFinite(savedProgress) && savedProgress >= 62
      ? Math.min(350, savedProgress)
      : 62;
  } catch {
    return 62;
  }
}

function getSavedHabitat(): HabitatName {
  try {
    const savedHabitat = window.localStorage.getItem("ocurest-habitat");
    return savedHabitat === "clear" ||
      savedHabitat === "moonlit" ||
      savedHabitat === "tidepool" ||
      savedHabitat === "coral" ||
      savedHabitat === "kelp" ||
      savedHabitat === "starlight"
      ? savedHabitat
      : "tidepool";
  } catch {
    return "tidepool";
  }
}

function getSavedAccessibility(): AccessibilityPreferences {
  const defaults: AccessibilityPreferences = {
    textSize: "default",
    highContrast: false,
    largerControls: false,
    reducedMotion: false,
  };
  try {
    const saved = window.localStorage.getItem("ocurest-accessibility");
    return saved
      ? { ...defaults, ...(JSON.parse(saved) as Partial<AccessibilityPreferences>) }
      : defaults;
  } catch {
    return defaults;
  }
}

function SchedulePage({ onStartSession }: { onStartSession: () => void }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [sessions, setSessions] = useState<Record<string, StudySession[]>>(() => {
    try {
      const saved = window.localStorage.getItem("ocurest-study-schedule");
      if (saved) return JSON.parse(saved) as Record<string, StudySession[]>;
    } catch {
      // Starter sessions are used if local storage is unavailable.
    }
    return {
      [dateKey(new Date())]: [
        {
          id: crypto.randomUUID(),
          title: "Review lecture notes",
          time: "10:00",
          duration: 45,
          location: "Library",
        },
        {
          id: crypto.randomUUID(),
          title: "Reading block",
          time: "15:30",
          duration: 60,
          location: "Quiet study space",
        },
      ],
    };
  });
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    time: "14:00",
    duration: "45",
    location: "",
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("ocurest-study-schedule", JSON.stringify(sessions));
    } catch {
      // The schedule remains available for the current browser session.
    }
  }, [sessions]);

  useEffect(() => {
    const clearSchedule = () => setSessions({});
    window.addEventListener("ocurest-data-cleared", clearSchedule);
    return () => window.removeEventListener("ocurest-data-cleared", clearSchedule);
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const selectedKey = dateKey(selectedDate);
  const selectedSessions = [...(sessions[selectedKey] ?? [])].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  const selectedMinutes = selectedSessions.reduce((total, session) => total + session.duration, 0);
  const weekSessions = weekDays.flatMap((day) => sessions[dateKey(day)] ?? []);
  const completedMinutes = weekSessions
    .filter((session) => session.completed)
    .reduce((total, session) => total + session.duration, 0);
  const weekMinutes = weekSessions.reduce((total, session) => total + session.duration, 0);
  const completion = weekMinutes ? Math.round((completedMinutes / weekMinutes) * 100) : 0;

  function changeWeek(amount: number) {
    const next = addDays(weekStart, amount * 7);
    setWeekStart(next);
    setSelectedDate(next);
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setWeekStart(startOfWeek(today));
  }

  function openForm(session?: StudySession) {
    setEditingSession(session ?? null);
    setForm(
      session
        ? {
            title: session.title,
            time: session.time,
            duration: String(session.duration),
            location: session.location,
          }
        : { title: "", time: "14:00", duration: "45", location: "" },
    );
    setShowForm(true);
  }

  function saveSession(event: FormEvent) {
    event.preventDefault();
    const nextSession: StudySession = {
      id: editingSession?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      time: form.time,
      duration: Math.max(5, Number(form.duration)),
      location: form.location.trim() || "Study space",
      completed: editingSession?.completed ?? false,
    };
    setSessions((current) => ({
      ...current,
      [selectedKey]: editingSession
        ? (current[selectedKey] ?? []).map((session) =>
            session.id === editingSession.id ? nextSession : session,
          )
        : [...(current[selectedKey] ?? []), nextSession],
    }));
    setShowForm(false);
  }

  function deleteSession() {
    if (!editingSession) return;
    setSessions((current) => ({
      ...current,
      [selectedKey]: (current[selectedKey] ?? []).filter(
        (session) => session.id !== editingSession.id,
      ),
    }));
    setShowForm(false);
  }

  function toggleComplete(sessionId: string) {
    setSessions((current) => ({
      ...current,
      [selectedKey]: (current[selectedKey] ?? []).map((session) =>
        session.id === sessionId ? { ...session, completed: !session.completed } : session,
      ),
    }));
  }

  return (
    <section className="relative z-[1] mx-auto w-full max-w-[1280px] px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-none tracking-[-0.045em] text-[var(--heading)]">
            Plan your week.
          </h1>
          <p className="mt-3 text-sm text-[var(--body-muted)]">
            A little structure, with room to change your mind.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-lg text-[var(--ink)]"
            aria-label="Previous week"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => changeWeek(1)}
            className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-lg text-[var(--ink)]"
            aria-label="Next week"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-9 grid grid-cols-7 gap-1.5 rounded-[20px] border border-[var(--line)] bg-[var(--panel-strong)] p-2 sm:gap-3 sm:p-3">
        {weekDays.map((day) => {
          const selected = dateKey(day) === selectedKey;
          const hasSessions = (sessions[dateKey(day)]?.length ?? 0) > 0;
          return (
            <button
              key={dateKey(day)}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`relative rounded-[14px] px-1 py-3 text-center transition ${
                selected
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--body-muted)] hover:bg-[var(--surface-muted)]"
              }`}
              aria-label={day.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            >
              <span className="block text-[9px] font-bold uppercase tracking-wider">
                {day.toLocaleDateString([], { weekday: "short" })}
              </span>
              <strong className="mt-1 block text-lg">{day.getDate()}</strong>
              {hasSessions && (
                <span
                  className={`absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full ${
                    selected ? "bg-white/70" : "bg-[var(--accent)]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--heading)]">
                {selectedDate.toLocaleDateString([], { weekday: "long" })}’s plan
              </h2>
              <p className="mt-1 text-xs text-[var(--body-muted)]">
                {selectedSessions.length} {selectedSessions.length === 1 ? "session" : "sessions"} ·{" "}
                {formatMinutes(selectedMinutes)} planned
              </p>
            </div>
            <button
              type="button"
              onClick={() => openForm()}
              className="self-start rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white sm:self-auto"
            >
              Add session
            </button>
          </div>

          <div className="mt-2">
            {selectedSessions.length ? (
              selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`grid gap-4 border-b border-[var(--line)] py-5 last:border-0 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center ${
                    session.completed ? "opacity-55" : ""
                  }`}
                >
                  <time className="font-mono text-xs text-[var(--accent)]">
                    {formatTime(session.time)}
                  </time>
                  <div>
                    <h3
                      className={`text-sm font-bold text-[var(--ink)] ${
                        session.completed ? "line-through" : ""
                      }`}
                    >
                      {session.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--body-muted)]">
                      {session.location} · {formatMinutes(session.duration)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openForm(session)}
                      className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-semibold text-[var(--body-muted)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleComplete(session.id)}
                      className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-semibold text-[var(--ink)]"
                    >
                      {session.completed ? "Undo" : "Complete"}
                    </button>
                    {!session.completed && (
                      <button
                        type="button"
                        onClick={onStartSession}
                        className="rounded-full bg-[var(--soft)] px-3 py-2 text-[10px] font-bold text-[var(--accent)]"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="font-display text-lg font-bold text-[var(--heading)]">
                  Nothing planned yet
                </p>
                <p className="mt-2 text-xs text-[var(--body-muted)]">
                  Add a session when you’re ready.
                </p>
                <button
                  type="button"
                  onClick={() => openForm()}
                  className="mt-5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Schedule a session
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-6">
          <p className="text-sm font-bold text-[var(--ink)]">This week</p>
          <div
            className="mx-auto mt-7 grid size-36 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--accent) ${completion * 3.6}deg, var(--surface-muted) 0deg)`,
            }}
          >
            <div className="grid size-28 place-items-center rounded-full bg-[var(--panel-strong)] text-center">
              <div>
                <strong className="font-display text-3xl text-[var(--heading)]">
                  {completion}%
                </strong>
                <span className="mt-0.5 block text-[10px] text-[var(--body-muted)]">completed</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-[var(--body-muted)]">
            {formatMinutes(completedMinutes)} completed of {formatMinutes(weekMinutes)} scheduled
          </p>
          <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-bold text-[var(--ink)]">Saved on this device</p>
            <p className="mt-1 text-[10px] leading-4 text-[var(--body-muted)]">
              Your study plan stays in this browser.
            </p>
          </div>
        </aside>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#071018]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setShowForm(false);
          }}
        >
          <form
            onSubmit={saveSession}
            className="w-full max-w-[500px] rounded-t-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[0_30px_100px_rgba(5,16,25,.24)] sm:rounded-[24px] sm:p-8"
            aria-labelledby="schedule-form-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--body-muted)]">
                  {selectedDate.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h2
                  id="schedule-form-title"
                  className="font-display mt-1 text-2xl font-bold text-[var(--heading)]"
                >
                  {editingSession ? "Edit session" : "Add a session"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full bg-[var(--surface-muted)] p-2 text-[var(--body-muted)]"
                aria-label="Close session form"
              >
                <CloseIcon />
              </button>
            </div>

            <label className="mt-7 block text-xs font-bold text-[var(--ink)]">
              Session name
              <input
                autoFocus
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Biology review"
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-[var(--ink)]">
                Start time
                <input
                  required
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, time: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-xs font-bold text-[var(--ink)]">
                Duration
                <select
                  value={form.duration}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, duration: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="25">25 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block text-xs font-bold text-[var(--ink)]">
              Location or note
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Library, quiet floor"
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div className="mt-7 flex items-center justify-end gap-2">
              {editingSession && (
                <button
                  type="button"
                  onClick={deleteSession}
                  className="mr-auto rounded-full px-3 py-2 text-xs font-semibold text-[#b35d65]"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full px-4 py-2.5 text-xs font-semibold text-[var(--body-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white"
              >
                {editingSession ? "Save changes" : "Add to schedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function AnalyticsPage({
  onBack,
  onStartSession,
  onOpenSchedule,
}: {
  onBack: () => void;
  onStartSession: () => void;
  onOpenSchedule: () => void;
}) {
  const readSchedule = () => {
    try {
      return JSON.parse(window.localStorage.getItem("ocurest-study-schedule") ?? "{}") as Record<
        string,
        StudySession[]
      >;
    } catch {
      return {};
    }
  };
  const [schedule, setSchedule] = useState(readSchedule);

  useEffect(() => {
    const refresh = () => setSchedule(readSchedule());
    window.addEventListener("ocurest-data-cleared", refresh);
    return () => window.removeEventListener("ocurest-data-cleared", refresh);
  }, []);

  const today = new Date();
  const activityDays = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const activity = activityDays.map((date) => {
    const sessions = schedule[dateKey(date)] ?? [];
    return {
      date,
      minutes: sessions
        .filter((session) => session.completed)
        .reduce((total, session) => total + session.duration, 0),
    };
  });
  const completedSessions = Object.values(schedule)
    .flat()
    .filter((session) => session.completed);
  const completedMinutes = activity.reduce((total, day) => total + day.minutes, 0);
  const scheduledMinutes = activityDays.reduce(
    (total, day) =>
      total + (schedule[dateKey(day)] ?? []).reduce((sum, session) => sum + session.duration, 0),
    0,
  );
  const completionRate = scheduledMinutes
    ? Math.round((completedMinutes / scheduledMinutes) * 100)
    : 0;
  const maxActivity = Math.max(1, ...activity.map((day) => day.minutes));
  const upcoming = Object.entries(schedule)
    .flatMap(([key, sessions]) =>
      sessions.map((session) => {
        const [year, month, day] = key.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const [hours, minutes] = session.time.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
        return { session, date };
      }),
    )
    .filter(({ session, date }) => !session.completed && date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <section className="relative z-[1] mx-auto w-full max-w-[1280px] px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[var(--heading)]">
            Your focus, in context.
          </h1>
          <p className="mt-3 text-sm text-[var(--body-muted)]">
            Completed study activity from your saved schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="self-start rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] sm:self-auto"
        >
          Back to focus
        </button>
      </div>

      <div className="mt-9 grid gap-3 sm:grid-cols-3">
        {[
          [String(completedSessions.length), "sessions completed", "From your saved schedule"],
          [formatMinutes(completedMinutes), "focused this week", "Completed study time"],
          [
            `${completionRate}%`,
            "schedule completed",
            `${formatMinutes(scheduledMinutes)} planned`,
          ],
        ].map(([value, label, detail]) => (
          <div
            key={label}
            className="rounded-[20px] border border-[var(--line)] bg-[var(--panel-strong)] p-5"
          >
            <p className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--heading)]">
              {value}
            </p>
            <p className="mt-3 text-xs font-bold text-[var(--ink)]">{label}</p>
            <p className="mt-1 text-[10px] text-[var(--body-muted)]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <article className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--heading)]">
                Seven-day activity
              </h2>
              <p className="mt-1 text-xs text-[var(--body-muted)]">
                Minutes from sessions marked complete
              </p>
            </div>
            <span className="text-[10px] text-[var(--body-muted)]">Last 7 days</span>
          </div>

          <div className="mt-9 flex h-48 items-end justify-between gap-2 border-b border-[var(--line)]">
            {activity.map(({ date, minutes }) => (
              <div key={dateKey(date)} className="flex h-full flex-1 items-end">
                <div
                  className={`relative w-full rounded-t-md ${minutes ? "bg-[var(--accent)]" : "bg-[var(--surface-muted)]"}`}
                  style={{ height: `${minutes ? Math.max(8, (minutes / maxActivity) * 100) : 2}%` }}
                >
                  {minutes > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-[var(--body-muted)]">
                      {minutes}m
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 text-[9px] text-[var(--body-muted)]">
            {activity.map(({ date }) => (
              <span key={dateKey(date)} className="flex-1 text-center">
                {date.toLocaleDateString([], { weekday: "short" })}
              </span>
            ))}
          </div>
          {!completedMinutes && (
            <p className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4 text-center text-xs text-[var(--body-muted)]">
              Mark a scheduled session complete to begin this chart.
            </p>
          )}
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.55fr)]">
        <article className="flex flex-col justify-between gap-5 rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold text-[var(--accent)]">Up next</p>
            {upcoming ? (
              <>
                <h2 className="font-display mt-2 text-xl font-bold text-[var(--heading)]">
                  {upcoming.session.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--body-muted)]">
                  {upcoming.date.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {formatTime(upcoming.session.time)} · {upcoming.session.location}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display mt-2 text-xl font-bold text-[var(--heading)]">
                  Nothing scheduled yet
                </h2>
                <p className="mt-1 text-xs text-[var(--body-muted)]">
                  Add a session to start building activity history.
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="self-start rounded-full border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] sm:self-auto"
          >
            View schedule
          </button>
        </article>

        <article className="rounded-[22px] bg-[var(--deep)] p-6 text-white">
          <h2 className="font-display text-xl font-bold">Ready to focus?</h2>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Start a live session when you’re ready.
          </p>
          <button
            type="button"
            onClick={onStartSession}
            className="mt-5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[var(--deep)]"
          >
            Start focus session
          </button>
        </article>
      </div>
    </section>
  );
}

function HabitatPage({
  onBack,
  progress,
  selectedHabitat,
  onSelectHabitat,
}: {
  onBack: () => void;
  progress: number;
  selectedHabitat: HabitatName;
  onSelectHabitat: (habitat: HabitatName) => void;
}) {
  const habitats = habitatLevels.map((habitat, index) => ({
    ...habitat,
    number: String(index + 1).padStart(2, "0"),
    unlocked: progress >= habitat.points,
  }));
  const currentHabitat = habitats.find((habitat) => habitat.id === selectedHabitat)!;
  const journey = journeyState(progress);

  return (
    <section className="relative z-[1] mx-auto w-full max-w-[1280px] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.15rem)] font-medium leading-[1.02] tracking-[-0.05em] text-[var(--heading)]">
            Lumi’s {currentHabitat.label}.
            <br />
            <span className="text-[var(--muted)]">A space that grows with you.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="self-start rounded-full border border-[var(--line)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--panel-strong)] sm:self-auto"
        >
          Back to focus
        </button>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_340px]">
        <div
          className={`habitat-tank habitat-${selectedHabitat} relative min-h-[470px] overflow-hidden rounded-[24px] border border-white/20 shadow-[0_24px_65px_rgba(31,69,96,.16)]`}
        >
          <div className="habitat-light" />
          <span className="bubble left-[14%] top-[28%] size-3" />
          <span className="bubble left-[23%] top-[17%] size-1.5" />
          <span className="bubble right-[18%] top-[24%] size-2" />
          <span className="bubble right-[29%] top-[12%] size-4" />
          <span className="bubble left-[42%] top-[32%] size-2" />

          <div className="absolute inset-0 flex items-center justify-center pb-16">
            <div className="text-center">
              <MoonJellyCompanion className="mx-auto size-40 sm:size-48" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                Lumi is feeling calm
              </p>
            </div>
          </div>

          <svg
            className="absolute inset-x-0 bottom-0 h-44 w-full"
            viewBox="0 0 800 180"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 115c120-28 188 25 310 3 128-23 221-6 310 14 78 18 124 1 180-16v64H0v-65Z"
              fill="rgba(26,56,77,.52)"
            />
            <path
              d="M0 144c136-22 220 11 340 2 130-10 252 31 460-2v36H0v-36Z"
              fill="rgba(16,39,55,.72)"
            />
            <path
              d="M91 149c-2-36 10-66 28-91-2 32 10 55 3 91M130 150c4-27 20-42 38-53-8 20-7 37-16 53"
              stroke="var(--soft)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity=".56"
            />
            <path
              d="M649 154c-7-39 7-68 28-91-5 28 9 55 0 91M691 154c0-25 15-45 35-58-7 21-4 39-13 58"
              stroke="#efb6c9"
              strokeWidth="8"
              strokeLinecap="round"
              opacity=".66"
            />
            <circle cx="240" cy="154" r="12" fill="rgba(255,255,255,.16)" />
            <circle cx="271" cy="160" r="7" fill="rgba(255,255,255,.1)" />
            <circle cx="578" cy="159" r="15" fill="rgba(255,255,255,.13)" />
          </svg>

          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/15 bg-[#102a3b]/55 px-4 py-3 text-white backdrop-blur-md">
            <div>
              <p className="text-xs font-semibold">{currentHabitat.label}</p>
              <p className="mt-0.5 text-[10px] text-white/55">Active habitat</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold">
              Selected
            </span>
          </div>
        </div>

        <aside className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[0_12px_40px_rgba(47,75,96,.045)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {journey.next ? `Level ${journey.level + 1}` : "Journey complete"}
          </p>
          <h2 className="font-display mt-3 text-2xl tracking-[-0.03em] text-[var(--heading)]">
            {journey.next?.label ?? "Every habitat unlocked"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--body-muted)]">
            {journey.next?.description ??
              "Lumi’s full collection is ready whenever you want a change of scenery."}
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${journey.progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[var(--body-muted)]">
            <span>{journey.progress}% ready</span>
            <span>Healthy sessions + breaks</span>
          </div>

          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <p className="text-xs font-semibold text-[var(--ink)]">Habitat journey</p>
            <div className="mt-4 space-y-3">
              {habitats.map((habitat) => (
                <button
                  key={habitat.id}
                  type="button"
                  onClick={() => habitat.unlocked && onSelectHabitat(habitat.id)}
                  disabled={!habitat.unlocked}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    selectedHabitat === habitat.id
                      ? "bg-[var(--soft)]"
                      : "bg-[var(--surface-muted)] hover:brightness-95"
                  } disabled:cursor-not-allowed disabled:opacity-55`}
                >
                  <span className="font-mono text-[10px] text-[var(--accent)]">
                    {habitat.number}
                  </span>
                  <span className="flex-1 text-xs font-semibold text-[var(--ink)]">
                    {habitat.label}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--body-muted)]">
                    {selectedHabitat === habitat.id
                      ? "selected"
                      : habitat.unlocked
                        ? "use"
                        : "locked"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-[11px] leading-5 text-[var(--body-muted)]">
            Progress never goes backward. OcuRest rewards balanced focus, not endless screen time.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reminderSentRef = useRef(false);
  const [active, setActive] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "blocked-by-frame"
    | "in-use"
    | "not-found"
    | "unavailable"
  >("idle");
  const [sampleIndex, setSampleIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [reminder, setReminder] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<
    NotificationPermission | "unsupported"
  >(() => ("Notification" in window ? Notification.permission : "unsupported"));
  const [view, setView] = useState<"session" | "schedule" | "analytics" | "habitat">("session");
  const [reminderStyle, setReminderStyle] = useState<"gentle" | "direct">("gentle");
  const [reminderPace, setReminderPace] = useState<"responsive" | "balanced" | "spacious">(
    "balanced",
  );
  const [intention, setIntention] = useState<"Study" | "Read" | "Create">("Study");
  const [themeName, setThemeName] = useState<ThemeName>(getSavedTheme);
  const [colorMode, setColorMode] = useState<ColorMode>(getSavedMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(getSavedCompanion);
  const [companionProgress, setCompanionProgress] = useState(getSavedCompanionProgress);
  const [selectedHabitat, setSelectedHabitat] = useState<HabitatName>(getSavedHabitat);
  const [accessibility, setAccessibility] =
    useState<AccessibilityPreferences>(getSavedAccessibility);
  const [privacyMessage, setPrivacyMessage] = useState("");

  const sample = blinkSamples[sampleIndex];
  const theme = colorThemes[themeName];
  const triggerSeconds = reminderPace === "responsive" ? 10 : reminderPace === "balanced" ? 14 : 18;
  const lumiJourney = journeyState(companionProgress);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!active || elapsed === 0 || elapsed % 5 !== 0) return;
    setSampleIndex((value) => Math.min(value + 1, blinkSamples.length - 1));
  }, [active, elapsed]);

  useEffect(() => {
    if (active && elapsed >= triggerSeconds && !snoozed && !feedback && !reminderSentRef.current) {
      reminderSentRef.current = true;
      setReminder(true);
      void sendBrowserReminder();
    }
  }, [active, elapsed, snoozed, feedback, triggerSeconds]);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}reminder-sw.js`);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("soft-focus-theme", themeName);
    } catch {
      // The selected theme still applies for this session when storage is unavailable.
    }
  }, [themeName]);

  useEffect(() => {
    try {
      window.localStorage.setItem("soft-focus-mode", colorMode);
    } catch {
      // The selected mode still applies for this session when storage is unavailable.
    }
  }, [colorMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem("ocurest-companion", companionEnabled ? "on" : "off");
    } catch {
      // The companion choice still applies for this session when storage is unavailable.
    }
  }, [companionEnabled]);

  useEffect(() => {
    if (active && elapsed > 0 && elapsed % 30 === 0) {
      setCompanionProgress((progress) => Math.min(350, progress + 1));
    }
  }, [active, elapsed]);

  useEffect(() => {
    try {
      window.localStorage.setItem("ocurest-companion-progress", String(companionProgress));
    } catch {
      // Habitat progress still remains available for the current session.
    }
  }, [companionProgress]);

  useEffect(() => {
    const selectedLevel = habitatLevels.find((habitat) => habitat.id === selectedHabitat);
    if (selectedLevel && companionProgress < selectedLevel.points) {
      setSelectedHabitat(lumiJourney.current.id);
      return;
    }
    try {
      window.localStorage.setItem("ocurest-habitat", selectedHabitat);
    } catch {
      // The habitat choice still applies for the current session.
    }
  }, [selectedHabitat, companionProgress, lumiJourney.current.id]);

  useEffect(() => {
    if (!settingsOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen]);

  useEffect(() => {
    const rootFontSizes = { compact: "15px", default: "16px", large: "18px" };
    document.documentElement.style.fontSize = rootFontSizes[accessibility.textSize];
    try {
      window.localStorage.setItem("ocurest-accessibility", JSON.stringify(accessibility));
    } catch {
      // Accessibility choices still apply for the current session.
    }
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [accessibility]);

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  }

  async function sendBrowserReminder() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(
        reminderStyle === "gentle" ? "A little space for your eyes" : "Take an eye break now",
        {
          body:
            reminderStyle === "gentle"
              ? "When it feels right, look somewhere far away for 20 seconds."
              : "Look 20 feet away for 20 seconds, then return refreshed.",
          icon: `${import.meta.env.BASE_URL}favicon.png`,
          tag: "soft-focus-break",
        },
      );
      return;
    }

    const notification = new Notification(
      reminderStyle === "gentle" ? "A little space for your eyes" : "Take an eye break now",
      {
        body:
          reminderStyle === "gentle"
            ? "When it feels right, look somewhere far away for 20 seconds."
            : "Look 20 feet away for 20 seconds, then return refreshed.",
        icon: `${import.meta.env.BASE_URL}favicon.png`,
        tag: "soft-focus-break",
      },
    );
    notification.onclick = () => window.focus();
  }

  async function requestCamera() {
    setCameraStatus("requesting");
    setCameraOn(false);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unavailable");
      return false;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    let pendingStream: MediaStream | null = null;
    try {
      pendingStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const video = videoRef.current;
      if (!video) throw new Error("Video preview is not mounted");

      video.srcObject = pendingStream;
      video.muted = true;
      await video.play();

      streamRef.current = pendingStream;
      const videoTrack = pendingStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (streamRef.current === pendingStream) {
            streamRef.current = null;
            setCameraOn(false);
            setCameraStatus("unavailable");
          }
        };
      }

      setCameraOn(true);
      setCameraStatus("granted");
      return true;
    } catch (error) {
      pendingStream?.getTracks().forEach((track) => track.stop());
      setCameraOn(false);
      if (!(error instanceof DOMException)) {
        setCameraStatus("unavailable");
        return false;
      }

      const policyDocument = document as Document & {
        permissionsPolicy?: { allowsFeature: (feature: string) => boolean };
        featurePolicy?: { allowsFeature: (feature: string) => boolean };
      };
      const cameraAllowedByFrame =
        policyDocument.permissionsPolicy?.allowsFeature("camera") ??
        policyDocument.featurePolicy?.allowsFeature("camera") ??
        true;

      if (error.name === "NotAllowedError") {
        setCameraStatus(cameraAllowedByFrame ? "denied" : "blocked-by-frame");
      } else if (error.name === "NotReadableError" || error.name === "AbortError") {
        setCameraStatus("in-use");
      } else if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
        setCameraStatus("not-found");
      } else {
        setCameraStatus("unavailable");
      }
      return false;
    }
  }

  function startSession() {
    setActive(true);
    reminderSentRef.current = false;
    setElapsed(0);
    setSampleIndex(0);
    setFeedback(null);
    setSnoozed(false);
    void requestCamera();
  }

  function stopSession() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
    reminderSentRef.current = false;
    setCameraOn(false);
    setCameraStatus("idle");
    setReminder(false);
    setElapsed(0);
    setSampleIndex(0);
  }

  function recordFeedback(value: "helpful" | "early") {
    setFeedback(value);
    setReminder(false);
    if (value === "early") setSnoozed(true);
  }

  function clearLocalActivity() {
    try {
      window.localStorage.setItem("ocurest-study-schedule", "{}");
      window.localStorage.setItem("ocurest-companion-progress", "62");
    } catch {
      // React state is still cleared when local storage is unavailable.
    }
    setCompanionProgress(62);
    setSelectedHabitat("tidepool");
    window.dispatchEvent(new Event("ocurest-data-cleared"));
    setPrivacyMessage("Activity and habitat progress were cleared.");
    window.setTimeout(() => setPrivacyMessage(""), 3500);
  }

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const cameraMessage =
    cameraStatus === "requesting"
      ? "Waiting for camera permission…"
      : cameraStatus === "denied"
        ? "Camera permission was denied"
        : cameraStatus === "blocked-by-frame"
          ? "The embedded preview blocks camera access"
          : cameraStatus === "in-use"
            ? "Your camera is being used elsewhere"
            : cameraStatus === "not-found"
              ? "No camera was found"
              : "Camera could not start";
  const cameraHelp =
    cameraStatus === "denied"
      ? "Allow camera access in your browser’s site settings, then retry."
      : cameraStatus === "blocked-by-frame"
        ? "Open OcuRest in its own browser tab to use the camera."
        : cameraStatus === "in-use"
          ? "Close other video apps or tabs using the camera, then retry."
          : cameraStatus === "not-found"
            ? "Connect or enable a camera, then retry."
            : cameraStatus === "requesting"
              ? "Choose Allow in your browser’s permission prompt."
              : "Camera access requires a secure browser tab. Demo tracking is still available.";

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)] transition-colors duration-300 ${
        accessibility.largerControls ? "larger-controls" : ""
      } ${accessibility.reducedMotion ? "reduce-motion" : ""}`}
      style={
        {
          "--accent": theme.accent,
          "--deep": theme.deep,
          "--ink": colorMode === "dark" ? "#edf3f6" : theme.ink,
          "--heading": colorMode === "dark" ? "#f7fafc" : theme.deep,
          "--soft": theme.soft,
          "--muted": theme.muted,
          "--theme-glow":
            colorMode === "dark"
              ? `color-mix(in srgb, ${theme.accent} 24%, transparent)`
              : theme.glow,
          "--page": colorMode === "dark" ? "#101820" : "#f4f8fb",
          "--panel": colorMode === "dark" ? "rgba(27, 40, 51, .82)" : "rgba(255,255,255,.82)",
          "--panel-strong": colorMode === "dark" ? "#22313d" : "#ffffff",
          "--line": accessibility.highContrast
            ? colorMode === "dark"
              ? "rgba(255,255,255,.38)"
              : "rgba(18,41,58,.34)"
            : colorMode === "dark"
              ? "rgba(255,255,255,.11)"
              : "rgba(42,72,92,.11)",
          "--surface-muted": colorMode === "dark" ? "#25343f" : "#eaf2f7",
          "--body-muted": accessibility.highContrast
            ? colorMode === "dark"
              ? "#d9e1e6"
              : "#405562"
            : colorMode === "dark"
              ? "#a8b6bf"
              : "#70808a",
        } as CSSProperties
      }
    >
      <header className="relative z-10 mx-auto flex w-full max-w-[1360px] items-center justify-between border-b border-[var(--line)] px-5 py-5 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => setView("session")}
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]"
          aria-label="OcuRest home"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--accent)] text-white">
            <LumiMark className="size-[21px]" />
          </span>
          OcuRest
        </button>
        <div className="flex items-center gap-2">
          {view !== "session" && (
            <button
              type="button"
              onClick={() => setView("session")}
              className="rounded-full px-2 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--heading)] sm:px-3 sm:text-sm"
            >
              Focus
            </button>
          )}
          <button
            type="button"
            onClick={() => setView("schedule")}
            className={`rounded-full px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
              view === "schedule"
                ? "bg-[var(--surface-muted)] text-[var(--heading)]"
                : "text-[var(--muted)] hover:bg-[var(--panel-strong)]"
            }`}
          >
            <span className="sm:hidden">Plan</span>
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => setView("analytics")}
            className={`rounded-full px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
              view === "analytics"
                ? "bg-[var(--surface-muted)] text-[var(--heading)]"
                : "text-[var(--muted)] hover:bg-[var(--panel-strong)]"
            }`}
          >
            <span className="sm:hidden">Stats</span>
            <span className="hidden sm:inline">Insights</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="grid size-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--heading)]"
            aria-label="Open settings"
            title="Settings"
          >
            <SettingsIcon className="size-[18px]" />
          </button>
          {view === "session" && (
            <button
              type="button"
              onClick={active ? stopSession : startSession}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-90"
            >
              {active ? "End session" : "Start session"}
            </button>
          )}
        </div>
      </header>

      {view === "schedule" ? (
        <SchedulePage
          onStartSession={() => {
            setView("session");
            startSession();
          }}
        />
      ) : view === "analytics" ? (
        <AnalyticsPage
          onBack={() => setView("session")}
          onStartSession={() => {
            setView("session");
            startSession();
          }}
          onOpenSchedule={() => setView("schedule")}
        />
      ) : view === "habitat" ? (
        <HabitatPage
          onBack={() => setView("session")}
          progress={companionProgress}
          selectedHabitat={selectedHabitat}
          onSelectHabitat={setSelectedHabitat}
        />
      ) : (
        <section className="relative z-[1] mx-auto grid w-full max-w-[1360px] gap-8 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-10 lg:pb-14 lg:pt-14">
          <div className="min-w-0">
            <div className="mb-7 max-w-2xl">
              <h1 className="font-display text-[clamp(2.2rem,3.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--heading)]">
                Ready to focus?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--body-muted)] sm:text-[15px]">
                Start a session and OcuRest will gently let you know when a short reset might help.
              </p>
            </div>

            <div className="camera-frame group relative aspect-[16/10] min-h-[340px] overflow-hidden rounded-[24px] bg-[var(--deep)] shadow-[0_22px_55px_rgba(32,65,92,0.15)] sm:min-h-0">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full scale-x-[-1] object-cover transition-opacity duration-700 ${cameraOn ? "opacity-75" : "opacity-0"}`}
              />
              <div className="camera-wash absolute inset-0" />

              {!active && (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div className="max-w-sm">
                    <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full border border-white/15 bg-white/10 text-[#edf4e9] backdrop-blur">
                      <CameraIcon className="size-6" />
                    </span>
                    <h2 className="font-display text-2xl font-medium tracking-[-0.035em] text-white">
                      Let’s settle in
                    </h2>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/60">
                      Camera processing stays on this device. Your video is never saved.
                    </p>
                    <button
                      onClick={startSession}
                      className="mt-7 rounded-full bg-[#e9efdc] px-6 py-3 text-sm font-semibold text-[var(--deep)] transition hover:scale-[1.02] hover:bg-white"
                    >
                      Start focus session
                    </button>
                  </div>
                </div>
              )}

              {active && (
                <>
                  <div className="camera-glass absolute left-5 top-5 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#a9cf9b] opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-[var(--soft)]" />
                    </span>
                    {cameraOn ? "Camera on" : "Demo signal"}
                  </div>
                  <div className="absolute right-5 top-5 flex items-center gap-2">
                    <div
                      className="camera-glass rounded-full px-3 py-2 text-xs text-white/90 backdrop-blur-md"
                      aria-label={`Session time ${minutes} minutes ${seconds} seconds`}
                    >
                      <span className="mr-2 hidden text-white/50 sm:inline">Session</span>
                      <span className="font-mono tabular-nums">
                        {minutes}:{seconds}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopSession}
                      className="camera-glass rounded-full px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
                    >
                      End
                    </button>
                  </div>

                  {!cameraOn && (
                    <div className="absolute inset-0 grid place-items-center p-8 text-center">
                      <div>
                        {cameraStatus === "requesting" ? (
                          <span className="mx-auto block size-9 animate-spin rounded-full border-2 border-white/20 border-t-[var(--soft)]" />
                        ) : (
                          <CameraIcon className="mx-auto size-10 text-[#a8b9af]" />
                        )}
                        <p className="mt-4 text-sm font-medium text-white">{cameraMessage}</p>
                        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-white/50">
                          {cameraHelp}
                        </p>
                        {cameraStatus !== "requesting" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (cameraStatus === "blocked-by-frame") {
                                window.open(window.location.href, "_blank", "noopener,noreferrer");
                              } else {
                                void requestCamera();
                              }
                            }}
                            className="mt-5 rounded-full bg-[#e9efdc] px-5 py-2.5 text-xs font-semibold text-[var(--deep)] transition hover:bg-white"
                          >
                            {cameraStatus === "blocked-by-frame"
                              ? "Open in a new tab"
                              : "Try camera again"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="camera-glass absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 p-4 text-white shadow-lg backdrop-blur-xl sm:inset-x-auto sm:left-5 sm:w-[310px]">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-white/60">Focus signal</span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${sample.slow ? "bg-[#f5d898] text-[#5d4517]" : "bg-[var(--soft)] text-[#214b35]"}`}
                      >
                        {sample.label}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <p className="font-display text-xl tracking-[-0.02em] text-white/90">
                        {sample.message}
                      </p>
                      <div className="flex h-8 items-end gap-1" aria-hidden="true">
                        {[8, 18, 11, 25, 15, 28, 20, 13, 7].map((height, index) => (
                          <span
                            key={index}
                            className={`w-1 rounded-full transition-all duration-700 ${sample.slow && index > 5 ? "bg-[#efcf86]" : "bg-[#a9c9b9]"}`}
                            style={{ height: Math.max(5, height - sampleIndex * (index % 3)) }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-[var(--body-muted)]">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                Video stays on this device
              </span>
              <span>
                {reminderStyle} reminders · {reminderPace} pace
              </span>
            </div>
          </div>

          <aside className="flex flex-col lg:pt-[112px]">
            <div className="rounded-[22px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[0_12px_38px_rgba(47,75,96,.055)]">
              <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--soft)] text-[var(--accent)]">
                <SparkIcon />
              </span>
              <h2 className="font-display mt-6 text-xl font-medium leading-tight tracking-[-0.035em]">
                What are you focusing on?
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {(["Study", "Read", "Create"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIntention(item)}
                    className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                      intention === item
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "bg-[var(--surface-muted)] text-[var(--body-muted)] hover:brightness-95"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[18px] bg-[var(--surface-muted)] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--body-muted)]">Reminder</span>
                  <span className="font-semibold capitalize text-[var(--ink)]">
                    {reminderStyle} · {reminderPace}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[var(--body-muted)]">Appearance</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {theme.label} · {colorMode === "dark" ? "Dark" : "Light"}
                  </span>
                </div>
              </div>

              {companionEnabled && (
                <div className="pet-card mt-4 flex items-center gap-3 rounded-[18px] border border-[var(--line)] p-3">
                  <MoonJellyCompanion className="size-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[var(--ink)]">
                        Lumi is drifting nearby
                      </p>
                      <button
                        type="button"
                        onClick={() => setView("habitat")}
                        className="text-[9px] font-semibold uppercase tracking-wider text-[var(--accent)] underline decoration-[var(--accent)] underline-offset-4"
                      >
                        Visit
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--body-muted)]">
                      {lumiJourney.next
                        ? `Level ${lumiJourney.level} · Next: ${lumiJourney.next.label}`
                        : "All habitats unlocked"}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                        style={{ width: `${lumiJourney.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="mt-4 w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-90"
              >
                Adjust settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setReminder(true);
                  setFeedback(null);
                }}
                className="mt-2 w-full rounded-full px-4 py-2.5 text-xs font-semibold text-[var(--body-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
              >
                Preview reminder
              </button>
            </div>

            {feedback && (
              <div
                className="mt-4 rounded-2xl bg-[var(--soft)] px-5 py-4 text-sm text-[var(--accent)]"
                role="status"
              >
                {feedback === "helpful"
                  ? "Noted. We’ll keep cues this subtle."
                  : "Got it. We’ll give you more space between cues."}
              </div>
            )}

            <p className="mt-auto pt-6 text-xs leading-5 text-[var(--body-muted)]">
              Prototype mode · Eye tracking uses sample data. Keep this tab open for reminders.
            </p>
          </aside>
        </section>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#071018]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSettingsOpen(false);
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[0_30px_100px_rgba(5,16,25,.24)] sm:rounded-[24px] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2
                  id="settings-title"
                  className="font-display text-3xl tracking-[-0.04em] text-[var(--heading)]"
                >
                  Make OcuRest yours.
                </h2>
                <p className="mt-2 text-sm text-[var(--body-muted)]">
                  These choices stay on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-[var(--surface-muted)] p-2.5 text-[var(--body-muted)] transition hover:text-[var(--ink)]"
                aria-label="Close settings"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ink)]">Appearance</p>
                <span className="text-xs text-[var(--body-muted)]">{theme.label}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(colorThemes) as ThemeName[]).map((name) => {
                  const option = colorThemes[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setThemeName(name)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        themeName === name
                          ? "border-[var(--accent)] bg-[var(--soft)] text-[var(--deep)]"
                          : "border-[var(--line)] bg-[var(--panel)] text-[var(--body-muted)]"
                      }`}
                      aria-pressed={themeName === name}
                    >
                      <span
                        className="size-4 rounded-full"
                        style={{ backgroundColor: option.accent }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">Dark mode</p>
                  <p className="mt-0.5 text-xs text-[var(--body-muted)]">
                    Softer contrast for low-light sessions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    colorMode === "dark" ? "bg-[var(--accent)]" : "bg-[#cbd5dc]"
                  }`}
                  role="switch"
                  aria-checked={colorMode === "dark"}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      colorMode === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-7">
              <p className="text-sm font-semibold text-[var(--ink)]">Accessibility</p>
              <p className="mt-1 text-xs text-[var(--body-muted)]">
                Adjust readability and motion across every OcuRest view.
              </p>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-[var(--ink)]">Text size</p>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--surface-muted)] p-1.5">
                  {(["compact", "default", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setAccessibility((current) => ({ ...current, textSize: size }))
                      }
                      className={`rounded-xl px-2 py-2.5 text-xs font-semibold capitalize transition ${
                        accessibility.textSize === size
                          ? "bg-[var(--panel-strong)] text-[var(--heading)] shadow-sm"
                          : "text-[var(--body-muted)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 divide-y divide-[var(--line)] rounded-2xl bg-[var(--surface-muted)] px-4">
                {[
                  {
                    key: "highContrast" as const,
                    title: "Higher contrast",
                    detail: "Strengthen text and interface borders",
                  },
                  {
                    key: "largerControls" as const,
                    title: "Larger controls",
                    detail: "Increase interactive target sizes",
                  },
                  {
                    key: "reducedMotion" as const,
                    title: "Reduce motion",
                    detail: "Pause floating and transition effects",
                  },
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-[var(--ink)]">{option.title}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--body-muted)]">{option.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAccessibility((current) => ({
                          ...current,
                          [option.key]: !current[option.key],
                        }))
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        accessibility[option.key] ? "bg-[var(--accent)]" : "bg-[#cbd5dc]"
                      }`}
                      role="switch"
                      aria-checked={accessibility[option.key]}
                      aria-label={`Toggle ${option.title.toLowerCase()}`}
                    >
                      <span
                        className={`absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
                          accessibility[option.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-7">
              <p className="text-sm font-semibold text-[var(--ink)]">Reminders</p>
              <p className="mt-1 text-xs text-[var(--body-muted)]">
                Choose how reminders sound and how much space they give you.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-muted)] p-1.5">
                {(["gentle", "direct"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setReminderStyle(style)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize transition ${
                      reminderStyle === style
                        ? "bg-[var(--panel-strong)] text-[var(--heading)] shadow-sm"
                        : "text-[var(--body-muted)]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-1.5">
                {(["responsive", "balanced", "spacious"] as const).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setReminderPace(pace)}
                    className={`flex-1 rounded-xl py-2.5 text-[10px] font-semibold capitalize transition ${
                      reminderPace === pace
                        ? "bg-[var(--soft)] text-[var(--accent)]"
                        : "text-[var(--body-muted)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MoonJellyCompanion className="size-14 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">Study companion</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--body-muted)]">
                      Lumi glows through focused study and healthy breaks.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompanionEnabled((enabled) => !enabled)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    companionEnabled ? "bg-[var(--accent)]" : "bg-[#cbd5dc]"
                  }`}
                  role="switch"
                  aria-checked={companionEnabled}
                  aria-label="Toggle study companion"
                >
                  <span
                    className={`absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
                      companionEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">Other-tab reminders</p>
                  <p className="mt-1 text-xs text-[var(--body-muted)]">
                    Show a browser notification while you study elsewhere.
                  </p>
                </div>
                {notificationStatus === "granted" ? (
                  <span className="rounded-full bg-[var(--soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
                    Enabled
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void requestNotificationPermission()}
                    disabled={
                      notificationStatus === "denied" || notificationStatus === "unsupported"
                    }
                    className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {notificationStatus === "denied"
                      ? "Blocked"
                      : notificationStatus === "unsupported"
                        ? "Unavailable"
                        : "Enable"}
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--body-muted)]">
                <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                Camera video is processed locally and never stored.
              </div>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-7">
              <p className="text-sm font-semibold text-[var(--ink)]">Privacy</p>
              <p className="mt-1 text-xs text-[var(--body-muted)]">
                Understand and control what OcuRest keeps.
              </p>

              <div className="mt-4 rounded-2xl bg-[var(--soft)] p-4">
                <p className="text-xs font-bold text-[var(--deep)]">
                  Your camera stays on this device
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-[var(--deep)] opacity-75">
                  Video is processed live and is never recorded, uploaded, or added to your history.
                  Preferences, schedules, and Lumi progress are stored only in this browser.
                </p>
              </div>

              <details className="mt-3 rounded-2xl border border-[var(--line)] px-4 py-3">
                <summary className="cursor-pointer text-xs font-bold text-[var(--ink)]">
                  What is stored locally?
                </summary>
                <ul className="mt-3 space-y-2 text-[11px] leading-5 text-[var(--body-muted)]">
                  <li>Theme, accessibility, and reminder preferences</li>
                  <li>Study schedule and completion status</li>
                  <li>Lumi’s progress and selected habitat</li>
                  <li>No camera images, video, or biometric recordings</li>
                </ul>
              </details>

              <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-[var(--surface-muted)] p-4">
                <div>
                  <p className="text-xs font-bold text-[var(--ink)]">Clear local activity</p>
                  <p className="mt-1 text-[10px] leading-4 text-[var(--body-muted)]">
                    Deletes your schedule and resets Lumi’s progress. Preferences stay unchanged.
                  </p>
                  {privacyMessage && (
                    <p className="mt-2 text-[10px] font-bold text-[var(--accent)]" role="status">
                      {privacyMessage}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearLocalActivity}
                  className="shrink-0 rounded-full border border-[#c98389]/35 px-3 py-2 text-[10px] font-bold text-[#b35d65]"
                >
                  Clear
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="mt-8 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-90"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {view === "session" && reminder && (
        <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-[430px] animate-[rise_.45s_cubic-bezier(.2,.8,.2,1)] sm:inset-x-auto sm:bottom-7 sm:right-7">
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[0_20px_70px_rgba(25,48,38,0.22)]">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e5ecdc] text-[var(--accent)]">
                <EyeIcon />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--body-muted)]">
                      {reminderStyle === "gentle" ? "A small reset" : "Time to reset"}
                    </p>
                    <h3 className="font-display mt-1 text-xl tracking-[-0.025em]">
                      {reminderStyle === "gentle"
                        ? "Look somewhere far away."
                        : "Take a 20-second eye break."}
                    </h3>
                  </div>
                  <button
                    onClick={() => setReminder(false)}
                    className="-mr-1 -mt-1 rounded-full p-2 text-[var(--body-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[#31473b]"
                    aria-label="Close reminder"
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-5 text-[var(--body-muted)]">
                  {reminderStyle === "gentle"
                    ? "Your blinking has slowed. Let your eyes soften for 20 seconds."
                    : "Your blink rhythm has slowed. Look 20 feet away, then return refreshed."}
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => recordFeedback("helpful")}
                    className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-90"
                  >
                    Helpful
                  </button>
                  <button
                    onClick={() => recordFeedback("early")}
                    className="rounded-full border border-[#d6dcd5] px-4 py-2.5 text-xs font-semibold text-[#516158] transition hover:bg-[#eff2ec]"
                  >
                    Too soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
