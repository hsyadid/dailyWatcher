'use client';

interface RestTimerProps {
  active: boolean;
  running: boolean;
  remaining: number;
  duration: number;
  onStart: () => void;
  onSkip: () => void;
  onDurationChange: (seconds: number) => void;
}

export default function RestTimer({
  active,
  running,
  remaining,
  duration,
  onStart,
  onSkip,
  onDurationChange,
}: RestTimerProps) {
  if (!active) return null;

  const progress = duration > 0 ? remaining / duration : 0;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = running ? `${minutes}:${String(secs).padStart(2, '0')}` : `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;

  // SVG circle for circular progress
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const displayProgress = running ? progress : 0;
  const dashOffset = circumference * (1 - displayProgress);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-700">
      {/* Linear progress bar */}
      <div className="h-1 w-full bg-zinc-800">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
          style={{ width: `${displayProgress * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto gap-3">
        {/* Label */}
        <span className="text-sm font-medium text-zinc-400 w-10">Rest</span>

        {/* Circular countdown */}
        <div className="relative flex items-center justify-center">
          <svg width="60" height="60" className="-rotate-90">
            <circle cx="30" cy="30" r={r} fill="none" stroke="#3f3f46" strokeWidth="3" />
            <circle
              cx="30" cy="30" r={r}
              fill="none"
              stroke={running ? "#10b981" : "#6b7280"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
            />
          </svg>
          <span className={`absolute text-sm font-mono font-bold ${running ? 'text-emerald-400' : 'text-zinc-500'}`}>{timeStr}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Duration stepper (disabled when running) */}
          {!running && (
            <div className="flex items-center gap-1">
              <button
                onPointerDown={() => onDurationChange(Math.max(15, duration - 15))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 active:bg-zinc-700 text-lg leading-none select-none"
              >
                −
              </button>
              <span className="text-xs text-zinc-500 w-8 text-center tabular-nums">{duration}s</span>
              <button
                onPointerDown={() => onDurationChange(Math.min(300, duration + 15))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 active:bg-zinc-700 text-lg leading-none select-none"
              >
                +
              </button>
            </div>
          )}

          {/* Start or Skip */}
          {!running ? (
            <button
              onPointerDown={onStart}
              className="px-5 h-9 bg-emerald-600 active:bg-emerald-700 rounded-xl text-sm font-semibold text-white select-none"
            >
              Start
            </button>
          ) : (
            <button
              onPointerDown={onSkip}
              className="px-4 h-9 bg-zinc-700 active:bg-zinc-600 rounded-xl text-sm font-semibold text-zinc-100 select-none"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
