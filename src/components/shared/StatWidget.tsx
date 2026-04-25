import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  gradient?: string;
  suffix?: string;
  subtitle?: string;
  trend?: { value: number; label: string };
}

export default function StatWidget({
  title,
  value,
  icon: Icon,
  color = '#22c55e',
  gradient = 'from-eco-500/20 to-eco-900/5',
  suffix,
  subtitle,
  trend,
}: StatWidgetProps) {
  const isNumber = typeof value === 'number';
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 80, damping: 20 });
  const rounded = useTransform(spring, Math.round);

  useEffect(() => {
    if (isNumber) count.set(value as number);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative glass rounded-2xl p-5 border border-[var(--color-border-subtle)] overflow-hidden bg-gradient-to-br ${gradient} cursor-default`}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${color}25`, boxShadow: `0 4px 15px ${color}30` }}
        >
          <Icon size={20} style={{ color }} />
        </motion.div>

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
            trend.value >= 0 ? 'text-eco-400 bg-eco-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        {isNumber ? (
          <motion.span className="text-3xl font-bold font-[Space_Grotesk,sans-serif]" style={{ color }}>
            {rounded}
          </motion.span>
        ) : (
          <span className="text-2xl font-bold font-[Space_Grotesk,sans-serif]" style={{ color }}>
            {value}
          </span>
        )}
        {suffix && (
          <span className="text-[var(--color-text-secondary)] text-sm mb-0.5">{suffix}</span>
        )}
      </div>

      <p className="text-[var(--color-text-primary)] text-sm font-medium mt-1">{title}</p>
      {subtitle && (
        <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">{subtitle}</p>
      )}
    </motion.div>
  );
}
