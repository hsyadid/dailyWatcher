import type { DefaultExercise, RoutineName } from './types';

export const ROUTINE_NAMES: RoutineName[] = ['Upper', 'Lower', 'Push', 'Pull', 'Leg'];

export const ROUTINES: Record<RoutineName, DefaultExercise[]> = {
  Upper: [
    { name: 'Peck Deck Fly',            muscleGroup: 'Chest',      defaultSets: 3, targetReps: '8-10' },
    { name: 'Incline DB Bench Press',   muscleGroup: 'Chest',      defaultSets: 3, targetReps: '8-10' },
    { name: 'Lat Pulldown',             muscleGroup: 'Back',       defaultSets: 2, targetReps: '8-10' },
    { name: 'Bent-Over Barbell Row',    muscleGroup: 'Back',       defaultSets: 3, targetReps: '6-8'  },
    { name: 'DB Lateral Raise',         muscleGroup: 'Shoulder',   defaultSets: 3, targetReps: '8'    },
    { name: 'EZ-Bar Curl',              muscleGroup: 'Biceps',     defaultSets: 3, targetReps: '10'   },
    { name: 'Skull Crusher',            muscleGroup: 'Triceps',    defaultSets: 3, targetReps: '10-12'},
  ],
  Lower: [
    { name: 'Back Squat',               muscleGroup: 'Quadriceps', defaultSets: 3, targetReps: '6'    },
    { name: 'Romanian Deadlift',        muscleGroup: 'Hamstrings', defaultSets: 3, targetReps: '6-8'  },
    { name: 'Leg Press',                muscleGroup: 'Quadriceps', defaultSets: 3, targetReps: '10'   },
    { name: 'Seated Leg Curl',          muscleGroup: 'Hamstrings', defaultSets: 3, targetReps: '12'   },
    { name: 'Standing Calf Raise',      muscleGroup: 'Calves',     defaultSets: 3, targetReps: '15'   },
    { name: 'Hanging Knee Raise',       muscleGroup: 'Core',       defaultSets: 3, targetReps: '15'   },
  ],
  Push: [
    { name: 'Incline Bench Press',      muscleGroup: 'Chest',      defaultSets: 3, targetReps: '6-8'  },
    { name: 'Seated DB Shoulder Press', muscleGroup: 'Shoulder',   defaultSets: 3, targetReps: '8'    },
    { name: 'Weighted Dip',             muscleGroup: 'Chest',      defaultSets: 3, targetReps: '8-10' },
    { name: 'DB Lateral Raise',         muscleGroup: 'Shoulder',   defaultSets: 3, targetReps: '12-15'},
    { name: 'Skull Crusher (EZ-Bar)',   muscleGroup: 'Triceps',    defaultSets: 3, targetReps: '10-12'},
    { name: 'Rope Triceps Push-down',   muscleGroup: 'Triceps',    defaultSets: 3, targetReps: '12-15'},
  ],
  Pull: [
    { name: 'Lat Pulldown (wide)',      muscleGroup: 'Back',       defaultSets: 3, targetReps: '5'    },
    { name: 'Cable Row',                muscleGroup: 'Back',       defaultSets: 3, targetReps: '8-10' },
    { name: 'Wide Grip Row',            muscleGroup: 'Back',       defaultSets: 3, targetReps: '6-8'  },
    { name: 'Face Pull',                muscleGroup: 'Shoulder',   defaultSets: 3, targetReps: '12-15'},
    { name: 'DB Curl',                  muscleGroup: 'Biceps',     defaultSets: 3, targetReps: '8-10' },
    { name: 'Hammer Curl',              muscleGroup: 'Biceps',     defaultSets: 4, targetReps: '10-12'},
  ],
  Leg: [
    { name: 'Front Squat',              muscleGroup: 'Quadriceps', defaultSets: 3, targetReps: '8'    },
    { name: 'Barbell Hip Thrust',       muscleGroup: 'Glute',      defaultSets: 3, targetReps: '8'    },
    { name: 'Bulgarian Split Squat',    muscleGroup: 'Quadriceps', defaultSets: 3, targetReps: '10/leg'},
    { name: 'Romanian Deadlift',        muscleGroup: 'Hamstrings', defaultSets: 3, targetReps: '8'    },
    { name: 'Leg Extension',            muscleGroup: 'Quadriceps', defaultSets: 2, targetReps: '12'   },
    { name: 'Seated Calf Raise',        muscleGroup: 'Calves',     defaultSets: 3, targetReps: '15'   },
  ],
};
