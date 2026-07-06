'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type {
  Workout,
  ExerciseWithSets,
  SetLog,
  PreviousData,
  RoutineName,
} from '@/lib/types';
import { ROUTINES } from '@/lib/routines';
import { formatDisplayDate } from '@/lib/utils';
import RestTimer from '@/components/RestTimer';
import RoutineSelectModal from '@/components/RoutineSelectModal';
import AddExerciseModal from '@/components/AddExerciseModal';

// ─── Muscle group accent colours ──────────────────────────────
const MUSCLE_COLORS: Record<string, string> = {
  Chest:      'text-blue-400',
  Back:       'text-green-400',
  Shoulder:   'text-yellow-400',
  Biceps:     'text-purple-400',
  Triceps:    'text-orange-400',
  Quadriceps: 'text-red-400',
  Hamstrings: 'text-pink-400',
  Glute:      'text-rose-400',
  Calves:     'text-teal-400',
  Core:       'text-cyan-400',
  Other:      'text-zinc-400',
};

// ─── SetRow ────────────────────────────────────────────────────
interface SetRowProps {
  set: SetLog;
  prev: { weight: number | null; reps: number | null } | null;
  onUpdate: (field: 'weight' | 'reps', value: number | null) => void;
  onToggleComplete: () => void;
}

function SetRow({ set, prev, onUpdate, onToggleComplete }: SetRowProps) {
  const prevLabel = (() => {
    if (!prev) return '—';
    const w = prev.weight !== null ? `${prev.weight}` : null;
    const r = prev.reps   !== null ? `${prev.reps}`   : null;
    if (w && r) return `${w}×${r}`;
    if (w)      return `${w} kg`;
    if (r)      return `×${r}`;
    return '—';
  })();

  return (
    <div
      className={`grid items-center gap-2 px-4 py-2.5 ${
        set.is_completed ? 'opacity-50' : ''
      }`}
      style={{ gridTemplateColumns: '1.6rem 3.5rem 1fr 1fr 2.25rem' }}
    >
      {/* Set number */}
      <span className="text-xs font-mono text-zinc-600 text-center">{set.set_number}</span>

      {/* Previous data */}
      <span className="text-xs text-zinc-600 text-center truncate" title={`Prev: ${prevLabel}`}>
        {prevLabel}
      </span>

      {/* Weight (kg) */}
      <input
        type="number"
        inputMode="decimal"
        value={set.weight ?? ''}
        onChange={(e) =>
          onUpdate('weight', e.target.value !== '' ? parseFloat(e.target.value) : null)
        }
        placeholder={prev?.weight !== null && prev?.weight !== undefined ? String(prev.weight) : '—'}
        disabled={set.is_completed}
        className="h-11 w-full bg-zinc-800 border border-zinc-700 rounded-xl text-center text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
      />

      {/* Reps */}
      <input
        type="number"
        inputMode="numeric"
        value={set.reps ?? ''}
        onChange={(e) =>
          onUpdate('reps', e.target.value !== '' ? parseInt(e.target.value, 10) : null)
        }
        placeholder={
          set.target_reps ||
          (prev?.reps !== null && prev?.reps !== undefined ? String(prev.reps) : '—')
        }
        disabled={set.is_completed}
        className="h-11 w-full bg-zinc-800 border border-zinc-700 rounded-xl text-center text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
      />

      {/* Complete toggle */}
      <button
        onClick={onToggleComplete}
        className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-colors ${
          set.is_completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-zinc-600 active:border-emerald-400'
        }`}
      >
        {set.is_completed && (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 6.5L5 9.5L11 3.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── ExerciseCard ──────────────────────────────────────────────
interface ExerciseCardProps {
  exercise: ExerciseWithSets;
  prevData: Record<number, { weight: number | null; reps: number | null }>;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: number | null) => void;
  onToggleComplete: (set: SetLog) => void;
  onAddSet: () => void;
}

function ExerciseCard({
  exercise,
  prevData,
  onUpdateSet,
  onToggleComplete,
  onAddSet,
}: ExerciseCardProps) {
  const completedCount = exercise.sets.filter((s) => s.is_completed).length;
  const totalCount     = exercise.sets.length;
  const allDone        = totalCount > 0 && completedCount === totalCount;

  return (
    <div className={`bg-zinc-900 rounded-2xl overflow-hidden border ${allDone ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
      {/* Exercise header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-zinc-100 leading-snug">
            {exercise.exercise_name}
          </h3>
          <p className={`text-xs mt-0.5 ${MUSCLE_COLORS[exercise.muscle_group] ?? 'text-zinc-500'}`}>
            {exercise.muscle_group}
          </p>
        </div>
        <span className="ml-3 flex-shrink-0 text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid px-4 pb-1"
        style={{ gridTemplateColumns: '1.6rem 3.5rem 1fr 1fr 2.25rem' }}
      >
        <span className="text-[10px] text-zinc-700 text-center font-semibold uppercase">Set</span>
        <span className="text-[10px] text-zinc-700 text-center font-semibold uppercase">Prev</span>
        <span className="text-[10px] text-zinc-700 text-center font-semibold uppercase">kg</span>
        <span className="text-[10px] text-zinc-700 text-center font-semibold uppercase">Reps</span>
        <span />
      </div>
      <div className="h-px bg-zinc-800 mx-4" />

      {/* Set rows */}
      <div>
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            prev={prevData[set.set_number] ?? null}
            onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
            onToggleComplete={() => onToggleComplete(set)}
          />
        ))}
      </div>

      {/* Add set */}
      <button
        onClick={onAddSet}
        className="w-full py-3.5 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-500 active:text-emerald-400 border-t border-zinc-800"
      >
        <span className="text-lg leading-none">+</span> Add Set
      </button>
    </div>
  );
}

// ─── WorkoutPage ───────────────────────────────────────────────
export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const date   = params.date as string; // YYYY-MM-DD (from URL)

  const [workout,      setWorkout]      = useState<Workout | null>(null);
  const [exercises,    setExercises]    = useState<ExerciseWithSets[]>([]);
  const [previousData, setPreviousData] = useState<PreviousData>({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const [showRoutineSelect, setShowRoutineSelect] = useState(false);
  const [showAddExercise,   setShowAddExercise]   = useState(false);

  // Timer
  const [timerActive,    setTimerActive]    = useState(false);
  const [timerRunning,   setTimerRunning]   = useState(false); // NEW: whether countdown is happening
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [timerDuration,  setTimerDuration]  = useState(90);
  const [timerKey,       setTimerKey]       = useState(0); // increment to restart
  const timerIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTriggerKey   = useRef<string | null>(null);

  // Debounced-save map: setId → timeout handle
  const saveTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Fetch data ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: wData, error: wErr } = await supabase
        .from('workouts')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (wErr) throw wErr;
      if (!wData) { setWorkout(null); setExercises([]); setLoading(false); return; }

      setWorkout(wData as Workout);

      const { data: eData, error: eErr } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_id', wData.id)
        .order('order_index', { ascending: true });

      if (eErr) throw eErr;
      if (!eData || eData.length === 0) { setExercises([]); setLoading(false); return; }

      const exerciseIds = eData.map((e) => e.id);
      const { data: sData, error: sErr } = await supabase
        .from('set_logs')
        .select('*')
        .in('exercise_log_id', exerciseIds)
        .order('set_number', { ascending: true });

      if (sErr) throw sErr;

      const setsByEx: Record<string, SetLog[]> = {};
      sData?.forEach((s) => {
        if (!setsByEx[s.exercise_log_id]) setsByEx[s.exercise_log_id] = [];
        setsByEx[s.exercise_log_id].push(s as SetLog);
      });

      const withSets: ExerciseWithSets[] = eData.map((e) => ({
        ...e,
        sets: setsByEx[e.id] ?? [],
      }));
      setExercises(withSets);

      await loadPreviousData(eData.map((e) => e.exercise_name));
    } catch (err) {
      console.error(err);
      setError('Failed to load workout. Check your Supabase credentials.');
    } finally {
      setLoading(false);
    }
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPreviousData = async (names: string[]) => {
    const { data } = await supabase.rpc('get_previous_set_data', {
      p_exercise_names: names,
      p_before_date:    date,
    });
    const map: PreviousData = {};
    (data ?? []).forEach((row: { exercise_name: string; set_number: number; weight: number | null; reps: number | null }) => {
      if (!map[row.exercise_name]) map[row.exercise_name] = {};
      map[row.exercise_name][row.set_number] = { weight: row.weight, reps: row.reps };
    });
    setPreviousData(map);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Timer countdown ────────────────────────────────────────
  useEffect(() => {
    if (!timerRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setTimerRunning(false);
          activeTriggerKey.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning, timerKey]);

  // ── Create workout from routine ────────────────────────────
  const createWorkout = async (routineName: RoutineName | 'Custom') => {
    setShowRoutineSelect(false);
    setLoading(true);
    try {
      const { data: newWorkout, error: wErr } = await supabase
        .from('workouts')
        .insert({ date, routine_name: routineName, status: 'in_progress' })
        .select()
        .single();
      if (wErr) throw wErr;

      setWorkout(newWorkout as Workout);

      const routineExercises =
        routineName === 'Custom' ? [] : ROUTINES[routineName as RoutineName];

      if (routineExercises.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      const { data: newEx, error: eErr } = await supabase
        .from('exercise_logs')
        .insert(
          routineExercises.map((ex, idx) => ({
            workout_id:    newWorkout.id,
            exercise_name: ex.name,
            muscle_group:  ex.muscleGroup,
            order_index:   idx,
          }))
        )
        .select();
      if (eErr) throw eErr;

      const setInserts: object[] = [];
      newEx!.forEach((ex, exIdx) => {
        const def = routineExercises[exIdx];
        for (let s = 1; s <= def.defaultSets; s++) {
          setInserts.push({
            exercise_log_id: ex.id,
            set_number:      s,
            weight:          null,
            reps:            null,
            target_reps:     def.targetReps,
            is_completed:    false,
          });
        }
      });

      const { data: newSets, error: sErr } = await supabase
        .from('set_logs').insert(setInserts).select();
      if (sErr) throw sErr;

      const setsByEx: Record<string, SetLog[]> = {};
      newSets!.forEach((s) => {
        if (!setsByEx[s.exercise_log_id]) setsByEx[s.exercise_log_id] = [];
        setsByEx[s.exercise_log_id].push(s as SetLog);
      });

      setExercises(newEx!.map((e) => ({ ...e, sets: setsByEx[e.id] ?? [] })));
      await loadPreviousData(newEx!.map((e) => e.exercise_name));
    } catch (err) {
      console.error(err);
      setError('Failed to create workout.');
    } finally {
      setLoading(false);
    }
  };

  // ── Update a set field (debounced save) ────────────────────
  const updateSetField = useCallback(
    (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number | null) => {
      // Optimistic local update
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) }
            : ex
        )
      );
      // Debounced DB save
      const existing = saveTimeouts.current.get(setId);
      if (existing) clearTimeout(existing);
      saveTimeouts.current.set(
        setId,
        setTimeout(async () => {
          await supabase.from('set_logs').update({ [field]: value }).eq('id', setId);
          saveTimeouts.current.delete(setId);
        }, 800)
      );
    },
    []
  );

  // ── Toggle set complete (no auto-timer) ─────────────────────
  const toggleSetComplete = useCallback(
    async (exerciseId: string, set: SetLog) => {
      const newCompleted = !set.is_completed;

      // Optimistic local update
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, sets: ex.sets.map((s) => (s.id === set.id ? { ...s, is_completed: newCompleted } : s)) }
            : ex
        )
      );

      // Persist immediately (no debounce for completion)
      await supabase.from('set_logs').update({ is_completed: newCompleted }).eq('id', set.id);

      // Show timer when set is marked complete; hide when unchecked
      if (newCompleted) {
        setTimerActive(true);
      } else {
        setTimerActive(false);
        if (timerRunning) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimerRunning(false);
          activeTriggerKey.current = null;
        }
      }
    },
    [timerRunning]
  );

  // ── Add a new set to an exercise ───────────────────────────
  const addSet = useCallback(async (exercise: ExerciseWithSets) => {
    const maxSet     = exercise.sets.reduce((m, s) => Math.max(m, s.set_number), 0);
    const targetReps = exercise.sets[0]?.target_reps ?? '';

    const { data: newSet, error } = await supabase
      .from('set_logs')
      .insert({
        exercise_log_id: exercise.id,
        set_number:      maxSet + 1,
        weight:          null,
        reps:            null,
        target_reps:     targetReps,
        is_completed:    false,
      })
      .select()
      .single();

    if (error || !newSet) return;
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exercise.id ? { ...ex, sets: [...ex.sets, newSet as SetLog] } : ex
      )
    );
  }, []);

  // ── Add a custom exercise ──────────────────────────────────
  const addExercise = useCallback(
    async (name: string, muscleGroup: string) => {
      if (!workout) return;
      setShowAddExercise(false);

      const { data: newEx, error: eErr } = await supabase
        .from('exercise_logs')
        .insert({
          workout_id:    workout.id,
          exercise_name: name,
          muscle_group:  muscleGroup,
          order_index:   exercises.length,
        })
        .select()
        .single();
      if (eErr || !newEx) return;

      const { data: newSets, error: sErr } = await supabase
        .from('set_logs')
        .insert(
          Array.from({ length: 3 }, (_, i) => ({
            exercise_log_id: newEx.id,
            set_number:      i + 1,
            weight:          null,
            reps:            null,
            target_reps:     '',
            is_completed:    false,
          }))
        )
        .select();
      if (sErr) return;

      setExercises((prev) => [...prev, { ...newEx, sets: (newSets ?? []) as SetLog[] }]);

      // Fetch previous data for the new exercise
      const { data: prevRows } = await supabase.rpc('get_previous_set_data', {
        p_exercise_names: [name],
        p_before_date:    date,
      });
      if (prevRows && prevRows.length > 0) {
        setPreviousData((prev) => {
          const updated = { ...prev, [name]: {} as Record<number, { weight: number | null; reps: number | null }> };
          prevRows.forEach((r: { set_number: number; weight: number | null; reps: number | null }) => {
            updated[name][r.set_number] = { weight: r.weight, reps: r.reps };
          });
          return updated;
        });
      }
    },
    [workout, exercises.length, date]
  );

  // ── Timer controls ─────────────────────────────────────────
  const onStartTimer = useCallback(() => {
    setTimerRemaining(timerDuration);
    setTimerRunning(true);
  }, [timerDuration]);

  const skipTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    activeTriggerKey.current = null;
  }, []);

  const handleDurationChange = useCallback(
    (newDuration: number) => {
      setTimerDuration(newDuration);
      if (!timerRunning) setTimerRemaining(newDuration);
    },
    [timerRunning]
  );

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSets     = exercises.reduce((n, ex) => n + ex.sets.length, 0);
  const completedSets = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.is_completed).length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 pb-36">
      {/* ── Sticky header ────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 active:bg-zinc-800 text-xl"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500">{formatDisplayDate(date)}</p>
            {workout && (
              <p className="text-base font-semibold text-zinc-100 truncate">
                {workout.routine_name} Day
              </p>
            )}
          </div>
          {/* Progress badge */}
          {workout && totalSets > 0 && (
            <span className={`
              flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full
              ${completedSets === totalSets
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'}
            `}>
              {completedSets}/{totalSets}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {workout && totalSets > 0 && (
          <div className="h-0.5 bg-zinc-800 w-full">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-300"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Error banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── No workout ──────────────────────────────────── */}
        {!workout && (
          <div className="flex flex-col items-center justify-center pt-20 gap-6">
            <span className="text-6xl">🏋️</span>
            <div className="text-center">
              <h2 className="text-xl font-bold text-zinc-100">No workout planned</h2>
              <p className="text-sm text-zinc-500 mt-1">Pick a routine to get started</p>
            </div>
            <button
              onClick={() => setShowRoutineSelect(true)}
              className="px-8 py-4 bg-emerald-600 active:bg-emerald-700 rounded-2xl text-white font-semibold text-base"
            >
              + Add Workout
            </button>
          </div>
        )}

        {/* ── Workout exists but no exercises ─────────────── */}
        {workout && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-4">
            <p className="text-zinc-500 text-sm">No exercises yet</p>
            <button
              onClick={() => setShowAddExercise(true)}
              className="px-6 py-3 bg-zinc-800 active:bg-zinc-700 rounded-xl text-zinc-300 font-medium text-sm"
            >
              Add Exercise
            </button>
          </div>
        )}

        {/* ── Exercise cards ───────────────────────────────── */}
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            prevData={previousData[exercise.exercise_name] ?? {}}
            onUpdateSet={(setId, field, value) => updateSetField(exercise.id, setId, field, value)}
            onToggleComplete={(set) => toggleSetComplete(exercise.id, set)}
            onAddSet={() => addSet(exercise)}
          />
        ))}

        {/* ── Add exercise button ──────────────────────────── */}
        {workout && (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-4 border-2 border-dashed border-zinc-800 active:border-zinc-600 rounded-2xl text-sm font-medium text-zinc-600 active:text-zinc-400 transition-colors"
          >
            + Add Exercise
          </button>
        )}
      </main>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showRoutineSelect && (
        <RoutineSelectModal
          onSelect={createWorkout}
          onClose={() => setShowRoutineSelect(false)}
        />
      )}
      {showAddExercise && (
        <AddExerciseModal
          onAdd={addExercise}
          onClose={() => setShowAddExercise(false)}
        />
      )}

      {/* ── Rest timer ─────────────────────────────────────── */}
      <RestTimer
        active={timerActive}
        running={timerRunning}
        remaining={timerRemaining}
        duration={timerDuration}
        onStart={onStartTimer}
        onSkip={skipTimer}
        onDurationChange={handleDurationChange}
      />
    </div>
  );
}
