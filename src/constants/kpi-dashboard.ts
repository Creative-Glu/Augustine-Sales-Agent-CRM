export const CARD_COLOR_VARIANTS = {
  blue: {
    bg: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
    line: 'from-blue-500 to-cyan-500',
  },
  green: {
    bg: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800',
    accent: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-600 to-emerald-600',
    line: 'from-green-500 to-emerald-500',
  },
  purple: {
    bg: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600 to-pink-600',
    line: 'from-purple-500 to-pink-500',
  },
  orange: {
    bg: 'from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800',
    accent: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-600 to-amber-600',
    line: 'from-orange-500 to-amber-500',
  },
  red: {
    bg: 'from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800',
    accent: 'text-red-600 dark:text-red-400',
    gradient: 'from-red-600 to-rose-600',
    line: 'from-red-500 to-rose-500',
  },
  pink: {
    bg: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800',
    accent: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-600 to-rose-600',
    line: 'from-pink-500 to-rose-500',
  },
} as const;

export type CardColor = keyof typeof CARD_COLOR_VARIANTS;
