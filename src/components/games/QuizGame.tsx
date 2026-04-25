import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUESTIONS } from './gameUtils';

export default function QuizGame() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);

  const handleAnswer = (index: number) => {
    if (feedback !== null) return; // prevent double clicks
    
    const isCorrect = index === QUIZ_QUESTIONS[currentQ].correctAnswer;
    if (isCorrect) setScore(s => s + 10);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="text-center p-6 bg-[var(--color-bg-surface)] rounded-2xl border border-sky-500/30">
        <h3 className="text-2xl font-bold text-sky-400 mb-2">Quiz Complete! 🧠</h3>
        <p className="text-[var(--color-text-secondary)] mb-4">Your Score: {score} / {QUIZ_QUESTIONS.length * 10}</p>
        <button onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); }} className="px-4 py-2 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400">Restart Quiz</button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQ];

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 border border-[var(--color-border-subtle)] relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Quick Quiz</h2>
        <div className="text-sm font-semibold text-[var(--color-text-secondary)]">Q: {currentQ + 1}/{QUIZ_QUESTIONS.length}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-6">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let btnClass = "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:border-sky-500/50";
              if (feedback !== null) {
                if (i === q.correctAnswer) btnClass = "bg-eco-500/20 border-eco-500 text-eco-400";
                else if (feedback === 'wrong') btnClass = "bg-red-500/20 border-red-500 text-red-400 opacity-50";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
