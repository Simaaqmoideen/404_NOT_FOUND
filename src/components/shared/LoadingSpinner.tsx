import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-base)] gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-eco-500/20 border-t-eco-500"
      />
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        <Leaf size={14} className="text-eco-400" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
