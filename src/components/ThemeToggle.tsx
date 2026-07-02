'use client';

import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme, type Theme } from '@/providers/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

const OPTIONS: ReadonlyArray<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

/**
 * Modern segmented pill toggle for switching between light and dark themes.
 * The active segment is highlighted by a spring-animated indicator that
 * slides between options (shared `layoutId` via framer-motion).
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`relative grid grid-cols-2 gap-1 rounded-full border border-slate-700/60 bg-slate-900/60 p-1 shadow-inner shadow-black/20 backdrop-blur-sm ${className ?? ''}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Switch to ${label.toLowerCase()} mode`}
            onClick={() => setTheme(value)}
            className={`group relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {active && (
              <motion.span
                layoutId="theme-toggle-active"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-blue-600 to-blue-500 shadow-sm shadow-blue-500/40"
              />
            )}
            <Icon
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                active ? 'scale-110' : 'group-hover:scale-110'
              }`}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
