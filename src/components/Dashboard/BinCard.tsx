import React from 'react';
import { motion } from 'framer-motion';
import { Bin } from '../../types';
import { MapPin, Users, RefreshCw } from 'lucide-react';
import { mockResetBin } from '../../services/mockData';

interface BinCardProps {
  bin: Bin;
  showReset?: boolean;
}

const WASTE_TYPES = [
  { key: 'plasticLevel', label: 'Plastic', color: '#3b82f6', icon: '♻️' },
  { key: 'organicLevel', label: 'Organic', color: '#22c55e', icon: '🌿' },
  { key: 'metalLevel', label: 'Metal', color: '#f59e0b', icon: '🔩' },
  { key: 'paperLevel', label: 'Paper', color: '#a855f7', icon: '📄' },
] as const;

export default function BinCard({ bin, showReset }: BinCardProps) {
  const [resetting, setResetting] = React.useState(false);

  const handleReset = async () => {
    setResetting(true);
    await mockResetBin(bin.id);
    setResetting(false);
  };

  const statusConfig = {
    full: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', dot: 'bg-red-400' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400' },
    empty: { color: 'text-eco-400', bg: 'bg-eco-500/10 border-eco-500/30', dot: 'bg-eco-400' },
  };
  const sc = statusConfig[bin.status];

  return (
    <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-all border border-[var(--color-border-subtle)] group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{bin.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-[var(--color-text-secondary)]" />
            <p className="text-xs text-[var(--color-text-secondary)] truncate">{bin.address}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ml-2 ${sc.bg} ${sc.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
          {bin.status.toUpperCase()}
        </div>
      </div>

      {/* Fill levels */}
      <div className="space-y-2.5 mb-4">
        {WASTE_TYPES.map(({ key, label, color, icon }) => {
          const level = bin[key] as number;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                  <span>{icon}</span>{label}
                </span>
                <span className="text-xs font-medium" style={{ color }}>{level}%</span>
              </div>
              <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, opacity: level > 80 ? 1 : 0.7 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs">
          <Users size={12} />
          <span>{bin.residents.length} residents</span>
        </div>
        {showReset && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-eco-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
