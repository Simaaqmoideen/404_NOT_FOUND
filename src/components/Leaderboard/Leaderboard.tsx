import React from 'react';
import { motion } from 'framer-motion';
import type { User } from '../../types';
import { BADGES } from '../../types';
import { Trophy, Crown, Medal, Zap, Star } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  currentUserId?: string;
}

const RANK_CONFIG = [
  { icon: Crown, label: '1st', podiumClass: 'podium-gold', color: '#fbbf24', iconColor: 'text-yellow-400', size: 20 },
  { icon: Trophy, label: '2nd', podiumClass: 'podium-silver', color: '#94a3b8', iconColor: 'text-slate-300', size: 18 },
  { icon: Medal, label: '3rd', podiumClass: 'podium-bronze', color: '#b45309', iconColor: 'text-amber-600', size: 16 },
];

export default function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const top = users.slice(0, 10);
  const topThree = top.slice(0, 3);
  const rest = top.slice(3);

  return (
    <div>
      {/* Podium — Top 3 */}
      {topThree.length >= 1 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {/* 2nd place */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`flex-1 max-w-[140px] rounded-2xl p-4 text-center ${RANK_CONFIG[1].podiumClass}`}
            >
              <div className="text-2xl mb-2 animate-float-d1">{RANK_CONFIG[1].icon && <Trophy size={22} className="mx-auto text-slate-300" />}</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400/30 to-slate-600/30 border-2 border-slate-300/40 flex items-center justify-center text-lg font-bold text-[var(--color-text-primary)] mx-auto mb-2">
                {topThree[1].name.charAt(0)}
              </div>
              <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{topThree[1].name.split(' ')[0]}</p>
              <div className="flex items-center justify-center gap-1 mt-1.5 text-slate-300">
                <Zap size={10} />
                <span className="text-xs font-bold">{topThree[1].points.toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">🥈 2nd</div>
            </motion.div>
          )}

          {/* 1st place — tallest */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
            className={`flex-1 max-w-[160px] rounded-2xl p-5 text-center ${RANK_CONFIG[0].podiumClass} scale-105 relative`}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-3xl mb-2 mx-auto flex justify-center"
            >
              <Crown size={28} className="text-yellow-400" />
            </motion.div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border-2 border-yellow-400/50 flex items-center justify-center text-xl font-bold text-[var(--color-text-primary)] mx-auto mb-2 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {topThree[0].name.charAt(0)}
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{topThree[0].name.split(' ')[0]}</p>
            <div className="flex items-center justify-center gap-1 mt-1.5 text-yellow-400">
              <Zap size={11} />
              <span className="text-sm font-bold">{topThree[0].points.toLocaleString()}</span>
            </div>
            <div className="text-xs text-yellow-400/80 mt-1 font-semibold">🏆 Champion</div>
            {/* Star sparkles */}
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 text-yellow-400"><Star size={14} fill="currentColor" /></motion.div>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="absolute top-2 -left-2 text-yellow-400"><Star size={10} fill="currentColor" /></motion.div>
          </motion.div>

          {/* 3rd place */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className={`flex-1 max-w-[140px] rounded-2xl p-4 text-center ${RANK_CONFIG[2].podiumClass}`}
            >
              <div className="mb-2 flex justify-center"><Medal size={20} className="text-amber-600" /></div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700/30 to-orange-900/30 border-2 border-amber-700/40 flex items-center justify-center text-lg font-bold text-[var(--color-text-primary)] mx-auto mb-2">
                {topThree[2].name.charAt(0)}
              </div>
              <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{topThree[2].name.split(' ')[0]}</p>
              <div className="flex items-center justify-center gap-1 mt-1.5 text-amber-600">
                <Zap size={10} />
                <span className="text-xs font-bold">{topThree[2].points.toLocaleString()}</span>
              </div>
              <div className="text-xs text-amber-700 mt-1">🥉 3rd</div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of the list */}
      <div className="space-y-2">
        {rest.map((user, idx) => {
          const rank = idx + 4;
          const badge = [...BADGES].reverse().find(b => user.points >= b.requiredPoints);
          const isCurrentUser = user.id === currentUserId;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 + 0.4 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrentUser
                  ? 'bg-eco-500/10 border border-eco-500/30 animate-border-glow'
                  : 'glass hover:bg-[var(--glass-strong-bg)]'
              }`}
            >
              <div className="w-7 h-7 flex items-center justify-center font-bold text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-surface-hover)] rounded-lg">
                #{rank}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eco-500/20 to-sky-500/20 flex items-center justify-center text-sm font-bold text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-eco-400' : 'text-[var(--color-text-primary)]'}`}>
                    {user.name}
                  </p>
                  {isCurrentUser && <span className="text-[9px] bg-eco-500/20 text-eco-400 px-1.5 py-0.5 rounded-full">YOU</span>}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">{user.location}</p>
              </div>
              {badge && <span className="text-base" title={badge.name}>{badge.icon}</span>}
              <div className="flex items-center gap-1 bg-eco-500/10 border border-eco-500/20 px-2.5 py-1 rounded-lg">
                <Zap size={10} className="text-eco-400" />
                <span className="text-eco-400 text-xs font-bold">{user.points.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
