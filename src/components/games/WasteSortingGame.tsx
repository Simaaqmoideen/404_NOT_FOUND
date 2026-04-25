import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ITEMS, BINS } from './gameUtils';

export default function WasteSortingGame() {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState(ITEMS);
  const [shakeBin, setShakeBin] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDrop = (e: React.DragEvent, binId: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    const item = items.find(i => i.id === draggedItem);
    if (!item) return;

    if (item.type === binId) {
      setScore(s => s + 10);
      setItems(prev => prev.filter(i => i.id !== draggedItem));
    } else {
      setShakeBin(binId);
      setTimeout(() => setShakeBin(null), 500);
    }
    setDraggedItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-6 bg-[var(--color-bg-surface)] rounded-2xl border border-eco-500/30">
        <h3 className="text-2xl font-bold text-eco-400 mb-2">You Won! 🎉</h3>
        <p className="text-[var(--color-text-secondary)] mb-4">Total Score: {score}</p>
        <button onClick={() => { setItems(ITEMS); setScore(0); }} className="px-4 py-2 bg-eco-500 text-white rounded-xl font-bold hover:bg-eco-400">Play Again</button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 border border-[var(--color-border-subtle)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Sort the Waste!</h2>
        <div className="bg-eco-500/20 text-eco-400 px-3 py-1 rounded-full font-bold">Score: {score}</div>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              draggable
              onDragStart={(e: any) => handleDragStart(e, item.id)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-sm"
            >
              <span className="text-2xl" title={item.name}>{item.emoji}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BINS.map(bin => (
          <motion.div
            key={bin.id}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e: any) => handleDrop(e, bin.id)}
            animate={shakeBin === bin.id ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="h-32 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-colors"
            style={{ borderColor: bin.color, backgroundColor: `${bin.color}10` }}
          >
            <span className="font-bold text-center px-2 text-sm" style={{ color: bin.color }}>{bin.name}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--color-text-secondary)] mt-4">Drag the items into the correct bin!</p>
    </div>
  );
}
