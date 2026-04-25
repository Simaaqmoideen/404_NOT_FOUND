import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Leaf, Cpu, Trophy, Globe, Zap, ArrowRight, Trash2, Shield, BarChart3, Recycle, Star, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import AnimatedButton from '../components/shared/AnimatedButton';

/* ── Floating particles ── */
const PARTICLES = ['🌿', '♻️', '🌍', '💚', '🌱', '⚡', '🍃', '🔋'];

function FloatingParticle({ emoji, delay, x, duration }: { emoji: string; delay: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none select-none opacity-20"
      style={{ left: `${x}%`, top: '110%' }}
      animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 0.3, 0.3, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      {emoji}
    </motion.div>
  );
}

/* ── Animated number counter ── */
function CounterUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 24);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring' }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-all group cursor-default relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}08, transparent 70%)` }} />
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg"
        style={{ backgroundColor: `${color}20`, boxShadow: `0 4px 20px ${color}25` }}
      >
        <Icon size={22} style={{ color }} />
      </motion.div>
      <h3 className="font-bold text-[var(--color-text-primary)] mb-2 font-[Space_Grotesk,sans-serif]">{title}</h3>
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const particles = PARTICLES.map((emoji, i) => ({
    emoji, delay: i * 2.5,
    x: 5 + (i * 13) % 90,
    duration: 12 + (i * 3) % 8,
  }));

  const features = [
    { icon: Cpu, title: t('home.feature_ai'), desc: t('home.feature_ai_desc'), color: '#3b82f6', delay: 0 },
    { icon: Trophy, title: t('home.feature_gamified'), desc: t('home.feature_gamified_desc'), color: '#f59e0b', delay: 0.1 },
    { icon: Zap, title: t('home.feature_realtime'), desc: t('home.feature_realtime_desc'), color: '#22c55e', delay: 0.2 },
    { icon: Globe, title: t('home.feature_multilingual'), desc: t('home.feature_multilingual_desc'), color: '#a855f7', delay: 0.3 },
  ];

  const stats = [
    { value: 248, suffix: '+', label: t('home.stats_bins'), icon: '🗑️' },
    { value: 12400, suffix: '+', label: t('home.stats_residents'), icon: '👥' },
    { value: 840000, suffix: '+', label: t('home.stats_points'), icon: '⚡' },
    { value: 5, suffix: '', label: t('home.stats_cities'), icon: '🏙️' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-28 px-4 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-hero opacity-60 pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}
        </div>

        {/* Glowing orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-16 left-1/4 w-[500px] h-[500px] bg-eco-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-eco-500/10 border border-eco-500/30 rounded-full text-eco-400 text-sm font-medium mb-8"
          >
            <span className="status-dot-eco" />
            {t('home.live_badge')}
            <ArrowRight size={14} />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif] leading-tight mb-6"
          >
            {t('home.hero_title').split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className={`inline-block mr-3 ${word.toLowerCase().includes('smart') || word.toLowerCase().includes('green') ? 'text-gradient-eco' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <AnimatedButton variant="eco" iconRight={ArrowRight} glow className="text-base px-8 py-3.5">
                  {t('home.go_to_dashboard')}
                </AnimatedButton>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <AnimatedButton variant="eco" iconRight={ArrowRight} glow className="text-base px-8 py-3.5">
                    {t('home.register')}
                  </AnimatedButton>
                </Link>
                <Link to="/login">
                  <AnimatedButton variant="ghost" className="text-base px-8 py-3.5">
                    {t('home.resident_login')}
                  </AnimatedButton>
                </Link>
                <Link to="/login?tab=admin">
                  <AnimatedButton variant="ghost" icon={Shield} className="text-base px-6 py-3.5">
                    {t('home.admin_login')}
                  </AnimatedButton>
                </Link>
              </>
            )}
          </motion.div>

          {/* Floating bin demo */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-7xl mt-14 inline-block"
          >
            🗑️
          </motion.div>
        </div>
      </section>



      {/* ── FEATURES ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-eco-400 text-sm font-semibold uppercase tracking-wider">{t('home.why_smartwaste')}</span>
            <h2 className="text-3xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif] mt-2">
              {t('home.built_for')} <span className="text-gradient-eco">{t('home.smarter')}</span> {t('home.bengaluru')}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 bg-[var(--color-bg-surface)]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-sky-400 text-sm font-semibold uppercase tracking-wider">{t('home.simple_process')}</span>
            <h2 className="text-3xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif] mt-2">
              {t('home.how_it_works')} <span className="text-gradient-blue">{t('home.works')}</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📸', step: '01', title: t('home.step1_title'), desc: t('home.step1_desc') },
              { icon: '🤖', step: '02', title: t('home.step2_title'), desc: t('home.step2_desc') },
              { icon: '⚡', step: '03', title: t('home.step3_title'), desc: t('home.step3_desc') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring' }}
                className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)] text-center relative overflow-hidden group"
              >
                <div className="absolute top-3 right-4 text-5xl font-black text-[var(--color-border-subtle)] font-[Space_Grotesk,sans-serif] select-none">
                  {item.step}
                </div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.8 }}
                  className="text-4xl mb-4"
                >
                  {item.icon}
                </motion.div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2 font-[Space_Grotesk,sans-serif]">{item.title}</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            className="relative rounded-3xl p-8 text-center overflow-hidden cursor-default"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(14,165,233,0.15))' }}
          >
            <div className="absolute inset-0 border-2 border-eco-500/20 rounded-3xl animate-border-glow pointer-events-none" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="text-5xl mb-4"
            >
              🚀
            </motion.div>
            <h2 className="text-2xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif] mb-3">
              {t('home.cta_title')} <span className="text-gradient-eco">{t('home.cta_title_highlight')}</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
              {t('home.cta_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">

              {!user && (
                <Link to="/register">
                  <AnimatedButton variant="ghost" icon={Users} className="text-base px-6 py-3.5">
                    {t('home.register_free')}
                  </AnimatedButton>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--color-border-subtle)] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-bold text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">BinWise</span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-xs">{t('home.footer_copy')}</p>
      </footer>
    </div>
  );
}
