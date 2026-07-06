'use client';

import { useState } from 'react';

interface AddExerciseModalProps {
  onAdd: (name: string, muscleGroup: string) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulder', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glute', 'Calves', 'Core', 'Other',
];

export default function AddExerciseModal({ onAdd, onClose }: AddExerciseModalProps) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Other');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, muscleGroup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl px-4 pt-3 pb-10 shadow-2xl">
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="text-xl font-bold text-zinc-100 mb-5 px-1">Add Exercise</h2>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Exercise Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Barbell Bench Press"
              autoFocus
              className="w-full h-12 px-4 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-base"
            />
          </div>

          {/* Muscle group chips */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Muscle Group</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setMuscleGroup(mg)}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${muscleGroup === mg
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'}
                  `}
                >
                  {mg}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full h-14 bg-emerald-600 active:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl text-white font-semibold text-base transition-colors"
          >
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
