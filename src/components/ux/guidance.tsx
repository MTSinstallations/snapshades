/**
 * UX Guidance Components
 * 
 * Help users through complex flows without feeling lost.
 * Inspired by: Notion (contextual tips), Figma (inline help),
 * Duolingo (progress celebration), Apple (step clarity)
 */

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Lightbulb, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';

/**
 * ContextualTip — Shows a floating tip near an element.
 * Auto-dismisses, but user can close it.
 */
export function ContextualTip({ children, tip, position = 'bottom' }: {
  children: ReactNode; tip: string; position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(true);

  if (dismissed) return <>{children}</>;

  const posClass = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-30 ${posClass[position]}`}
          >
            <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 max-w-[220px] shadow-lg flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
              <button onClick={() => { setShow(false); setDismissed(true); }} className="ml-1 flex-shrink-0">
                <X className="w-3 h-3 text-gray-400 hover:text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * StepIndicator — Visual progress through a multi-step flow.
 * Shows completed, current, and upcoming steps.
 */
export function StepIndicator({ steps, currentStep, onStepClick }: {
  steps: { label: string; key: string }[];
  currentStep: string;
  onStepClick?: (key: string) => void;
}) {
  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const isComplete = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isClickable = onStepClick && (isComplete || isCurrent);

        return (
          <div key={step.key} className="flex items-center gap-1">
            <button
              onClick={() => isClickable && onStepClick?.(step.key)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isCurrent ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' :
                isComplete ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                'bg-gray-100 text-gray-400'
              }`}
            >
              {isComplete && <CheckCircle className="w-3 h-3" />}
              {isCurrent && <motion.div className="w-2 h-2 bg-white rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />}
              <span>{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className={`w-3 h-3 flex-shrink-0 ${i < currentIdx ? 'text-green-400' : 'text-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * CelebrationBurst — Quick celebration animation when user completes something.
 * Inspired by Duolingo's dopamine hits.
 */
export function CelebrationBurst({ show, message = "Nice!" }: {
  show: boolean; message?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-5 h-5" />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * EmptyState — Friendly empty state with action. Never leave a blank page.
 */
export function EmptyState({ icon, title, description, actionLabel, onAction }: {
  icon: ReactNode; title: string; description: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * InfoBanner — Dismissible banner for important info. Shows once.
 */
export function InfoBanner({ id, children, variant = 'info' }: {
  id: string; children: ReactNode; variant?: 'info' | 'success' | 'warning';
}) {
  const storageKey = `ss_banner_${id}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === '1');

  if (dismissed) return null;

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`border rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm ${colors[variant]}`}
    >
      <div className="flex items-center gap-2 flex-1">{children}</div>
      <button onClick={() => { setDismissed(true); localStorage.setItem(storageKey, '1'); }}>
        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </motion.div>
  );
}

/**
 * SkeletonLoader — Animated loading placeholder. Use instead of spinners.
 */
export function SkeletonLoader({ lines = 3, className = '' }: {
  lines?: number; className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded-lg"
          style={{ width: `${85 - i * 15}%` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
