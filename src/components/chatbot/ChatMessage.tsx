import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  isBot: boolean;
}

export default function ChatMessage({ text, isBot }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
        isBot 
          ? 'bg-[var(--color-bg-surface-hover)] text-[var(--color-text-primary)] rounded-tl-sm' 
          : 'bg-eco-500 text-white rounded-tr-sm shadow-md shadow-eco-500/20'
      }`}>
        {text}
      </div>
    </motion.div>
  );
}
