import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  variant?: 'eco' | 'ghost' | 'danger' | 'amber';
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function AnimatedButton({
  variant = 'eco',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  glow = false,
  className = '',
  onClick,
  disabled,
  type = 'button',
}: AnimatedButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; background:rgba(255,255,255,0.35);
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        animation: ripple-burst 0.6s linear;
        pointer-events:none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    if (!disabled && !loading && onClick) onClick(e);
  };

  const variantClasses: Record<string, string> = {
    eco: 'bg-gradient-eco text-white shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)] hover:brightness-110',
    ghost: 'glass border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:border-eco-500/40',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)]',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_4px_15px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.4)]',
  };

  return (
    <motion.button
      ref={btnRef}
      whileHover={{ scale: disabled || loading ? 1 : 1.03, y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      className={`
        relative overflow-hidden inline-flex items-center justify-center gap-2
        font-semibold rounded-2xl px-5 py-3 text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${glow && variant === 'eco' ? 'animate-pulse-eco' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={16} />}
    </motion.button>
  );
}
