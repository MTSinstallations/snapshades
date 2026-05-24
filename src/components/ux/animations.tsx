/**
 * UX Animation Components
 * 
 * Inspired by: Apple (smooth transitions), Stripe (staggered reveals),
 * Linear (glassmorphism), Airbnb (delightful micro-interactions)
 * 
 * Rules:
 * - Every interaction acknowledged within 100ms
 * - Staggered reveals (not everything at once)
 * - Respect prefers-reduced-motion
 * - Touch targets 44px minimum
 */

import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

// ============================================================
// FADE + SLIDE VARIANTS
// ============================================================

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Staggered container
export const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// ============================================================
// WRAPPER COMPONENTS
// ============================================================

/**
 * FadeIn — Fades content up on mount. Use for page sections.
 */
export function FadeIn({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerList — Children animate in one by one. Use for card grids, lists.
 */
export function StaggerList({ children, className = '' }: {
  children: ReactNode; className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: {
  children: ReactNode; className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * PageTransition — Wraps page content for smooth route transitions.
 */
export function PageTransition({ children, className = '' }: {
  children: ReactNode; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverScale — Subtle scale on hover. Use for cards, buttons.
 */
export function HoverScale({ children, scale = 1.02, className = '' }: {
  children: ReactNode; scale?: number; className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCounter — Counts up to a number. Use for stats.
 */
export function AnimatedCounter({ value, duration = 1.5, prefix = '', suffix = '' }: {
  value: number; duration?: number; prefix?: string; suffix?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration, ease: 'easeOut' }}
        >
          {/* This is a simplified version — framer-motion doesn't natively count.
              For real counting animation, use useMotionValue + useTransform */}
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

/**
 * ProgressBar — Animated progress bar. Use for wizards, loading.
 */
export function ProgressBar({ percent, className = '' }: {
  percent: number; className?: string;
}) {
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-blue-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

/**
 * PulseOnce — Subtle pulse to draw attention. Use for CTAs, new features.
 */
export function PulseOnce({ children, className = '' }: {
  children: ReactNode; className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Modal animation wrapper
 */
export function ModalAnimation({ children, isOpen }: {
  children: ReactNode; isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Toast notification animation
 */
export function ToastAnimation({ children, isVisible }: {
  children: ReactNode; isVisible: boolean;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
