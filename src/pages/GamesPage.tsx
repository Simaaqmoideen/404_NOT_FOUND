import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Brain, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import WasteSortingGame from '../components/games/WasteSortingGame';
import QuizGame from '../components/games/QuizGame';

type GameMode = 'menu' | 'sorting' | 'quiz';

export default function GamesPage() {
  const [mode, setMode] = useState<GameMode>('menu');

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {mode !== 'menu' && (
              <button onClick={() => setMode('menu')} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-eco-400 text-sm transition-colors">Dashboard</Link>
            <span className="text-[var(--color-text-secondary)]">/</span>
            <span className="text-eco-400 text-sm font-semibold">Play & Learn</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">
            🎮 Play & Learn
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Learn waste management the fun way!</p>
        </motion.div>

        {/* Game Menu */}
        {mode === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('sorting')}
              className="glass rounded-2xl p-6 border border-eco-500/30 text-left hover:border-eco-500/60 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-eco-500/20 flex items-center justify-center mb-4 group-hover:bg-eco-500/30 transition-colors">
                <Gamepad2 size={28} className="text-eco-400" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Waste Sorting Game</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Drag & drop items into the correct bins. Earn 10 points per correct sort!</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-eco-500/20 text-eco-400 px-2 py-1 rounded-full font-semibold">Drag & Drop</span>
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full font-semibold">+10 pts each</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('quiz')}
              className="glass rounded-2xl p-6 border border-sky-500/30 text-left hover:border-sky-500/60 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/30 transition-colors">
                <Brain size={28} className="text-sky-400" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Quick Quiz</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Test your waste knowledge with multiple-choice questions. Score 10 per correct answer!</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full font-semibold">4 Questions</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-semibold">+10 pts each</span>
              </div>
            </motion.button>
          </motion.div>
        )}

        {mode === 'sorting' && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <WasteSortingGame />
          </motion.div>
        )}

        {mode === 'quiz' && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <QuizGame />
          </motion.div>
        )}
      </div>
    </div>
  );
}
