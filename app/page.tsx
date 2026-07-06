'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Workout } from '@/lib/types';
import {
  toLocalDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
  MONTH_NAMES,
  DAY_ABBR,
} from '@/lib/utils';

const ROUTINE_COLORS: Record<string, string> = {
  Upper:  'bg-blue-500',
  Lower:  'bg-orange-500',
  Push:   'bg-purple-500',
  Pull:   'bg-green-500',
  Leg:    'bg-red-500',
  Custom: 'bg-zinc-400',
};

const ROUTINE_CARD_BG: Record<string, string> = {
  Upper:  'bg-blue-500/10 border-blue-500/25',
  Lower:  'bg-orange-500/10 border-orange-500/25',
  Push:   'bg-purple-500/10 border-purple-500/25',
  Pull:   'bg-green-500/10 border-green-500/25',
  Leg:    'bg-red-500/10 border-red-500/25',
  Custom: 'bg-zinc-800/50 border-zinc-700/30',
};

export default function CalendarPage() {
  const router = useRouter();
  const today    = new Date();
  const todayStr = toLocalDateString(today);

  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth()); // 0-indexed
  const [workouts, setWorkouts] = useState<Record<string, Workout>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthWorkouts = async () => {
      setLoading(true);
      const mm    = String(month + 1).padStart(2, '0');
      const days  = getDaysInMonth(year, month);
      const first = `${year}-${mm}-01`;
      const last  = `${year}-${mm}-${String(days).padStart(2, '0')}`;

      const { data } = await supabase
        .from('workouts')
        .select('id, date, routine_name, status')
        .gte('date', first)
        .lte('date', last);

      const map: Record<string, Workout> = {};
      data?.forEach((w) => { map[w.date] = w as Workout; });
      setWorkouts(map);
      setLoading(false);
    };
    fetchMonthWorkouts();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col select-none">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={prevMonth}
            className="w-11 h-11 flex items-center justify-center rounded-full text-zinc-400 active:bg-zinc-800 text-2xl leading-none"
          >
            ‹
          </button>

          <button onClick={goToToday} className="text-center active:opacity-70">
            <h1 className="text-base font-semibold text-zinc-100">
              {MONTH_NAMES[month]} {year}
            </h1>
            {!isCurrentMonth && (
              <p className="text-xs text-emerald-500 mt-0.5">tap for today</p>
            )}
          </button>

          <button
            onClick={nextMonth}
            className="w-11 h-11 flex items-center justify-center rounded-full text-zinc-400 active:bg-zinc-800 text-2xl leading-none"
          >
            ›
          </button>
        </div>
      </header>

      <main className="flex-1 px-3 pt-2 pb-10 max-w-lg mx-auto w-full">
        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_ABBR.map((d, i) => (
            <div key={i} className="text-center text-xs text-zinc-600 font-semibold py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`pad-${idx}`} className="aspect-square" />;

              const mm      = String(month + 1).padStart(2, '0');
              const dd      = String(day).padStart(2, '0');
              const dateStr = `${year}-${mm}-${dd}`;
              const workout = workouts[dateStr];
              const isToday = dateStr === todayStr;
              const isPast  = dateStr < todayStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => router.push(`/workout/${dateStr}`)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl
                    transition-transform active:scale-90
                    ${isToday
                      ? 'bg-emerald-500 text-white'
                      : workout
                        ? 'bg-zinc-800 text-zinc-100'
                        : isPast
                          ? 'text-zinc-700'
                          : 'text-zinc-300'}
                  `}
                >
                  <span className="text-sm font-medium leading-none">{day}</span>
                  {workout && !isToday && (
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full ${
                        ROUTINE_COLORS[workout.routine_name] ?? 'bg-zinc-400'
                      }`}
                    />
                  )}
                  {workout && isToday && (
                    <span className="text-[9px] mt-0.5 font-bold opacity-90 leading-none tracking-wide">
                      {workout.routine_name.toUpperCase()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Workouts list this month */}
        {!loading && Object.keys(workouts).length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-3">
              This Month
            </p>
            <div className="space-y-2">
              {Object.values(workouts)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((w) => (
                  <button
                    key={w.id}
                    onClick={() => router.push(`/workout/${w.date}`)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3
                      border rounded-xl active:scale-[0.98] transition-transform
                      ${ROUTINE_CARD_BG[w.routine_name] ?? 'bg-zinc-800/50 border-zinc-700/30'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ROUTINE_COLORS[w.routine_name] ?? 'bg-zinc-400'}`} />
                      <span className="text-sm font-medium text-zinc-200">{w.routine_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{w.date}</span>
                      {w.status === 'completed' && <span className="text-emerald-400 text-xs">✓</span>}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Today CTA */}
        <button
          onClick={() => router.push(`/workout/${todayStr}`)}
          className="mt-6 w-full py-4 bg-emerald-600 active:bg-emerald-700 rounded-2xl text-white font-semibold text-base"
        >
          Today's Workout
        </button>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 px-1">
          {Object.entries(ROUTINE_COLORS).filter(([k]) => k !== 'Custom').map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-zinc-600">{name}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
