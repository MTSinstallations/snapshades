/**
 * UX Micro-Interactions
 * 
 * Small delights that make the app feel alive.
 * Inspired by: Stripe (hover glows), Apple (spring physics),
 * Linear (smooth everything), Notion (playful touches)
 */

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

/**
 * MagneticButton — Button that subtly moves toward cursor on hover.
 * Premium feel. Use for primary CTAs.
 */
export function MagneticButton({ children, className = '', onClick }: {
  children: ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * GlowCard — Card with subtle glow on hover. Use for product cards, features.
 */
export function GlowCard({ children, className = '', onClick }: {
  children: ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(37, 99, 235, 0.1)',
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 transition-colors cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * FloatingLabel — Input with label that floats up on focus.
 * Cleaner than static labels. Use in forms.
 */
export function FloatingInput({ label, type = 'text', value, onChange, ...props }: {
  label: string; type?: string; value: string;
  onChange: (value: string) => void;
} & Record<string, unknown>) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 pt-5 pb-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm peer"
        placeholder=" "
        {...props}
      />
      <label className={`absolute left-4 transition-all text-gray-400 pointer-events-none ${
        hasValue ? 'top-1.5 text-[10px] text-blue-600' : 'top-3.5 text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-600'
      }`}>
        {label}
      </label>
    </div>
  );
}

/**
 * SlidingTabs — Tabs with an animated underline that slides between options.
 */
export function SlidingTabs({ tabs, activeTab, onTabChange }: {
  tabs: { key: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}) {
  const activeIdx = tabs.findIndex(t => t.key === activeTab);

  return (
    <div className="relative flex bg-gray-100 rounded-xl p-1">
      {/* Sliding background */}
      <motion.div
        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
        initial={false}
        animate={{
          left: `calc(${(activeIdx / tabs.length) * 100}% + 4px)`,
          width: `calc(${100 / tabs.length}% - 8px)`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors rounded-lg ${
            tab.key === activeTab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/**
 * RippleButton — Material Design-inspired ripple effect on click.
 */
export function RippleButton({ children, className = '', onClick }: {
  children: ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.span
        className="absolute inset-0 bg-white/20 rounded-full"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      {children}
    </motion.button>
  );
}

/**
 * NumberTicker — Animates a number changing. Use for prices, counts.
 */
export function NumberTicker({ value, prefix = '', suffix = '', className = '' }: {
  value: number; prefix?: string; suffix?: string; className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </motion.span>
  );
}

/**
 * SwipeIndicator — Shows a swipe hint on mobile for horizontally scrollable content.
 */
export function SwipeIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1 text-xs text-gray-400 sm:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.span
        animate={{ x: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        ←
      </motion.span>
      Swipe to see more
    </motion.div>
  );
}
