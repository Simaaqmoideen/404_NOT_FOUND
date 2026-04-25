import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  glowTip?: boolean;
  delay?: number;
}

export default function ProgressBar({
  value,
  color = '#22c55e',
  gradientFrom = '#22c55e',
  gradientTo = '#0ea5e9',
  height = 8,
  showLabel = false,
  label,
  animate = true,
  glowTip = true,
  delay = 0,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-[var(--color-text-secondary)] capitalize">{label}</span>}
          {showLabel && (
            <span className="text-xs font-bold" style={{ color }}>{clamped}%</span>
          )}
        </div>
      )}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'var(--color-bg-surface-hover)' }}
      >
        <motion.div
          initial={animate ? { width: 0 } : { width: `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay }}
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          {/* Glowing tip */}
          {glowTip && clamped > 5 && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{
                backgroundColor: gradientTo,
                boxShadow: `0 0 8px ${gradientTo}, 0 0 16px ${gradientTo}50`,
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
