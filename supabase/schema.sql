-- ============================================================
-- Daily Workout Tracker — Supabase Database Schema
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================================

-- Enable UUID extension (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- TABLES
-- ========================

CREATE TABLE IF NOT EXISTS workouts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE        NOT NULL,
  routine_name TEXT       NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'in_progress',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT workouts_date_unique UNIQUE (date),
  CONSTRAINT workouts_status_check CHECK (status IN ('pending', 'in_progress', 'completed'))
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id    UUID    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT    NOT NULL,
  muscle_group  TEXT    NOT NULL DEFAULT '',
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS set_logs (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id  UUID     NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
  set_number       INTEGER  NOT NULL,
  weight           NUMERIC(7, 2),
  reps             INTEGER,
  target_reps      TEXT     NOT NULL DEFAULT '',
  is_completed     BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT set_logs_unique UNIQUE (exercise_log_id, set_number)
);

-- ========================
-- INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_workouts_date        ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_wid    ON exercise_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_name   ON exercise_logs(exercise_name);
CREATE INDEX IF NOT EXISTS idx_set_logs_elid        ON set_logs(exercise_log_id);

-- ========================
-- RPC: Progressive Overload Helper
-- Returns the most recent completed set data for each
-- (exercise_name, set_number) combination before a given date.
-- Used to display "Prev: 20kg × 8" labels in the UI.
-- ========================

CREATE OR REPLACE FUNCTION get_previous_set_data(
  p_exercise_names TEXT[],
  p_before_date    DATE
)
RETURNS TABLE (
  exercise_name TEXT,
  set_number    INTEGER,
  weight        NUMERIC,
  reps          INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT ON (el.exercise_name, sl.set_number)
    el.exercise_name,
    sl.set_number,
    sl.weight,
    sl.reps
  FROM set_logs sl
  JOIN exercise_logs el ON sl.exercise_log_id = el.id
  JOIN workouts       w  ON el.workout_id      = w.id
  WHERE el.exercise_name = ANY(p_exercise_names)
    AND w.date < p_before_date
    AND sl.is_completed = true
  ORDER BY
    el.exercise_name,
    sl.set_number,
    w.date DESC;
$$;

-- ========================
-- ROW LEVEL SECURITY
-- ========================
-- By default Supabase tables have RLS disabled.
-- For a personal / single-user app this is fine.
-- If you later add auth, enable RLS and add appropriate policies:
--
--   ALTER TABLE workouts       ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE exercise_logs  ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE set_logs       ENABLE ROW LEVEL SECURITY;
