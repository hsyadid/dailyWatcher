export type RoutineName = 'Upper' | 'Lower' | 'Push' | 'Pull' | 'Leg';
export type WorkoutStatus = 'pending' | 'in_progress' | 'completed';

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD (local)
  routine_name: string;
  status: WorkoutStatus;
  created_at?: string;
}

export interface ExerciseLog {
  id: string;
  workout_id: string;
  exercise_name: string;
  muscle_group: string;
  order_index: number;
  created_at?: string;
}

export interface SetLog {
  id: string;
  exercise_log_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  target_reps: string;
  is_completed: boolean;
  created_at?: string;
}

export interface ExerciseWithSets extends ExerciseLog {
  sets: SetLog[];
}

/** exercise_name → set_number → { weight, reps } from the last session */
export type PreviousData = Record<
  string,
  Record<number, { weight: number | null; reps: number | null }>
>;

export interface DefaultExercise {
  name: string;
  muscleGroup: string;
  defaultSets: number;
  targetReps: string;
}
