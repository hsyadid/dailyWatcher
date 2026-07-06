'use client';

import { ROUTINE_NAMES } from '@/lib/routines';
import type { RoutineName } from '@/lib/types';

interface RoutineSelectModalProps {
  onSelect: (routine: RoutineName | 'Custom') => void;
  onClose: () => void;
}

const ROUTINE_META: Record<string, { emoji: string; accent: string; border: string }> = {
  Upper:  { emoji: '💪', accent: 'active:bg-blue-500/20',   border: 'border-blue-500'   },
  Lower:  { emoji: '🦵', accent: 'active:bg-orange-500/20', border: 'border-orange-500' },
  Push:   { emoji: '⬆️', accent: 'active:bg-purple-500/20', border: 'border-purple-500' },
  Pull:   { emoji: '⬇️', accent: 'active:bg-green-500/20',  border: 'border-green-500'  },
  Leg:    { emoji: '🏃', accent: 'active:bg-red-500/20',    border: 'border-red-500'    },
  Custom: { emoji: '✏️', accent: 'active:bg-zinc-500/20',   border: 'border-zinc-500'   },
};

export default function RoutineSelectModal({ onSelect, onClose }: RoutineSelectModalProps) {
  const options: (RoutineName | 'Custom')[] = [...ROUTINE_NAMES, 'Custom'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl px-4 pt-3 pb-10 shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />

        <h2 className="text-xl font-bold text-zinc-100 mb-5 px-1">Select Routine</h2>

        <div className="grid grid-cols-2 gap-3">
          {options.map((name) => {
            const meta = ROUTINE_META[name];
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className={`
                  flex flex-col items-center justify-center gap-2 py-6
                  bg-zinc-800 border-2 ${meta.border} ${meta.accent}
                  rounded-2xl transition-colors
                `}
              >
                <span className="text-3xl">{meta.emoji}</span>
                <span className="text-base font-semibold text-zinc-100">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
