import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Trash2, Recycle, Gift, Clock, Star, Leaf, TrendingUp, Award, ScanLine, MessageSquare, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/shared/Navbar';
import Leaderboard from '../components/Leaderboard/Leaderboard';
import StatWidget from '../components/shared/StatWidget';
import ProgressBar from '../components/shared/ProgressBar';
import AnimatedButton from '../components/shared/AnimatedButton';
import { mockGetUserTransactions, mockGetBin } from '../services/mockData';
import type { Transaction, Bin } from '../types';
import { BADGES, REWARDS } from '../types';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';

const WASTE_ICONS: Record<string, string> = { plastic: '♻️', organic: '🌿', metal: '🔩', paper: '📄' };
const WASTE_COLORS: Record<string, string> = { plastic: '#3b82f6', organic: '#22c55e', metal: '#f59e0b', paper: '#a855f7' };
const WASTE_GRADIENT: Record<string, [string, string]> = {
  plastic: ['#3b82f6', '#0ea5e9'], organic: ['#22c55e', '#4ade80'],
  metal: ['#f59e0b', '#fb923c'], paper: ['#a855f7', '#ec4899'],
};

type Tab = 'stats' | 'leaderboard' | 'rewards';

export default function UserDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { leaderboard, bins, refreshLeaderboard } = useData();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userBin, setUserBin] = useState<Bin | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }
    mockGetUserTransactions(user.id).then(setTransactions);
    if (user.binId) mockGetBin(user.binId).then(b => b && setUserBin(b));
    refreshLeaderboard();
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? t('dashboard.greeting_morning') : hour < 17 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening'));
  }, [user, t]);

  if (!user) return null;

  const rank = leaderboard.findIndex(u => u.id === user.id) + 1;
  const currentBadge = [...BADGES].reverse().find(b => user.points >= b.requiredPoints) || BADGES[0];
  const nextBadge = BADGES.find(b => b.requiredPoints > user.points);
  const progressToNext = nextBadge
    ? Math.min(100, ((user.points - currentBadge.requiredPoints) / (nextBadge.requiredPoints - currentBadge.requiredPoints)) * 100)
    : 100;
  const wasteBreakdown = { plastic: 0, organic: 0, metal: 0, paper: 0 };
  transactions.forEach(tx => { wasteBreakdown[tx.wasteType as keyof typeof wasteBreakdown] += 1; });
  const totalDeposits = transactions.length;

  const handleClaimReward = (rewardId: string) => {
    const reward = REWARDS.find(r => r.id === rewardId);
    if (reward && user.points >= reward.pointsCost) {
      setClaimedRewards(prev => new Set([...prev, rewardId]));
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">

        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 mb-8 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(14,165,233,0.1) 50%, rgba(168,85,247,0.1) 100%)' }}
        >
          <div className="absolute inset-0 border border-eco-500/20 rounded-3xl pointer-events-none" />
          {/* Orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-eco-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[var(--color-text-secondary)] text-sm mb-1"
              >
                {greeting},
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]"
              >
                {user.name} <span className="animate-badge inline-block">{currentBadge.icon}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-eco-400 text-sm mt-1 font-medium"
              >
                {t('dashboard.save_planet')}
              </motion.p>
              <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">{user.residentId} · {user.location}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/learn">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-semibold rounded-xl text-sm border border-[var(--color-border-subtle)] hover:border-eco-500/40 hover:text-eco-400 transition-all"
                >
                  <MessageSquare size={15} /> Learn
                </motion.button>
              </Link>
              <Link to="/games">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-semibold rounded-xl text-sm border border-[var(--color-border-subtle)] hover:border-sky-500/40 hover:text-sky-400 transition-all"
                >
                  <Gamepad2 size={15} /> Play & Learn
                </motion.button>
              </Link>
              <Link to="/detect">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-eco-500 to-sky-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-eco-500/30 transition-all"
                >
                  <ScanLine size={15} /> {t('dashboard.scan_waste')}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatWidget title={t('dashboard.your_points')} value={user.points} icon={Zap} color="#22c55e" gradient="from-eco-500/20 to-eco-900/5" />
          <StatWidget title={t('dashboard.your_rank')} value={rank || 0} icon={Trophy} color="#f59e0b" gradient="from-amber-500/20 to-amber-900/5" suffix={rank ? `/ ${leaderboard.length}` : ''} />
          <StatWidget title={t('dashboard.total_deposits')} value={totalDeposits} icon={Recycle} color="#3b82f6" gradient="from-blue-500/20 to-blue-900/5" />
          <StatWidget title={t('dashboard.badge')} value={currentBadge.name} icon={Award} color="#a855f7" gradient="from-purple-500/20 to-purple-900/5" />
        </div>

        {/* ── Badge Progress ── */}
        {nextBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)] mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-eco-500/5 to-purple-500/5 pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-badge inline-block">{currentBadge.icon}</span>
                <div>
                  <p className="text-[var(--color-text-primary)] text-sm font-bold">{currentBadge.name}</p>
                  <p className="text-[var(--color-text-secondary)] text-xs">
                    {t('dashboard.progress_to')} {nextBadge.name} {nextBadge.icon}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-eco-400 font-bold text-sm">{user.points}</span>
                <span className="text-[var(--color-text-secondary)] text-xs"> / {nextBadge.requiredPoints} pts</span>
              </div>
            </div>
            <ProgressBar value={progressToNext} gradientFrom="#22c55e" gradientTo="#a855f7" height={10} glowTip />
            <p className="text-[var(--color-text-secondary)] text-xs mt-2">
              {nextBadge.requiredPoints - user.points} {t('dashboard.more_points')} <strong>{nextBadge.name}</strong>
            </p>
          </motion.div>
        )}

        {/* ── Tab Switcher ── */}
        <div className="flex bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-1.5 mb-6 max-w-sm">
          {(['stats', 'leaderboard', 'rewards'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-all capitalize ${
                activeTab === tab ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {activeTab === tab && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 bg-gradient-eco rounded-xl" />
              )}
              <span className="relative z-10">
                {tab === 'stats' ? `📊 ${t('dashboard.stats')}` : tab === 'leaderboard' ? `🏆 ${t('dashboard.ranks')}` : `🎁 ${t('dashboard.rewards')}`}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Waste breakdown */}
              <div className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-5 flex items-center gap-2 font-[Space_Grotesk,sans-serif]">
                  <TrendingUp size={16} className="text-eco-400" /> {t('dashboard.waste_contribution')}
                </h3>
                <div className="space-y-5">
                  {(Object.entries(wasteBreakdown) as [string, number][]).map(([type, count]) => {
                    const total = Object.values(wasteBreakdown).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const [from, to] = WASTE_GRADIENT[type] || ['#22c55e', '#4ade80'];
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-[var(--color-text-primary)] capitalize font-medium">
                            {WASTE_ICONS[type]} {type}
                          </span>
                          <span className="text-sm font-bold" style={{ color: WASTE_COLORS[type] }}>
                            {count} {t('dashboard.deposits')}
                          </span>
                        </div>
                        <ProgressBar value={pct} gradientFrom={from} gradientTo={to} height={8} glowTip />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction history */}
              <div className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 font-[Space_Grotesk,sans-serif]">
                  <Clock size={16} className="text-sky-400" /> {t('dashboard.waste_history')}
                </h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-10 text-[var(--color-text-secondary)]">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-4xl mb-3"
                    >🗑️</motion.div>
                    <p className="text-sm">{t('dashboard.no_history')}</p>
                  </div>
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    className="space-y-2.5 max-h-72 overflow-y-auto pr-1"
                  >
                    {transactions.slice(0, 10).map(tx => (
                      <motion.div
                        key={tx.id}
                        variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
                        className="flex items-center gap-3 p-3 bg-[var(--color-bg-surface-hover)] rounded-xl hover:bg-[var(--glass-strong-bg)] transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${WASTE_COLORS[tx.wasteType]}20` }}
                        >
                          {WASTE_ICONS[tx.wasteType]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-primary)] capitalize font-medium">{tx.wasteType}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {new Date(tx.timestamp).toLocaleDateString()} · {Math.round(tx.confidence)}% {t('dashboard.confidence')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-eco-500/10 border border-eco-500/20 px-2.5 py-1 rounded-lg">
                          <Zap size={10} className="text-eco-400" />
                          <span className="text-eco-400 text-xs font-bold">+{tx.pointsAwarded}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)]"
            >
              <h3 className="font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2 font-[Space_Grotesk,sans-serif]">
                <Trophy size={18} className="text-amber-400" /> {t('dashboard.leaderboard')}
              </h3>
              <Leaderboard users={leaderboard} currentUserId={user.id} />
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {REWARDS.map((reward, i) => {
                  const canClaim = user.points >= reward.pointsCost;
                  const claimed = claimedRewards.has(reward.id);
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={canClaim && !claimed ? { y: -6, scale: 1.02 } : {}}
                      className={`glass rounded-2xl p-5 border transition-all relative overflow-hidden ${
                        claimed ? 'border-eco-500/40' :
                        canClaim ? 'border-amber-500/40 cursor-pointer' : 'border-[var(--color-border-subtle)] opacity-60'
                      }`}
                    >
                      {canClaim && !claimed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                      )}
                      <motion.div
                        animate={canClaim && !claimed ? { rotate: [-5, 5, -5] } : {}}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="text-3xl mb-3"
                      >
                        {reward.icon}
                      </motion.div>
                      <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{reward.name}</h3>
                      <p className="text-[var(--color-text-secondary)] text-xs mb-3 leading-relaxed">{reward.description}</p>
                      <div className="flex items-center gap-1 text-eco-400 text-xs font-bold mb-3">
                        <Zap size={11} /> {reward.pointsCost} {t('common.points')}
                      </div>
                      <button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={!canClaim || claimed}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          claimed ? 'bg-eco-500/20 text-eco-400' :
                          canClaim ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-amber-500/30 hover:brightness-110' :
                          'bg-[var(--color-bg-surface-hover)] text-[var(--color-text-secondary)] cursor-not-allowed'
                        }`}
                      >
                        {claimed ? `✓ ${t('dashboard.claimed')}` :
                         canClaim ? `🎉 ${t('dashboard.claim')}` :
                         `${reward.pointsCost - user.points} pts needed`}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ChatbotWidget />
    </div>
  );
}
