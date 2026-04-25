import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  suffix?: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, color = '#22c55e', suffix, subtitle }: StatsCardProps) {
  const isNumber = typeof value === 'number';
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 100, damping: 30 });
  const rounded = useTransform(spring, Math.round);

  useEffect(() => {
    if (isNumber) count.set(value as number);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-subtle)] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="flex items-end gap-1">
        {isNumber ? (
          <motion.span className="text-3xl font-bold text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">
            {rounded}
          </motion.span>
        ) : (
          <span className="text-3xl font-bold text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{value}</span>
        )}
        {suffix && <span className="text-[var(--color-text-secondary)] text-sm mb-1">{suffix}</span>}
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm mt-1">{title}</p>
      {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
