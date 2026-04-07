'use client';

import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  showLive?: boolean;
}

export const Header = ({ title, subtitle = '', icon, showLive = true }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between py-2">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Icon Container */}
            {icon && (
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                {icon}
              </div>
            )}

            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          {subtitle && (
            <p className="text-slate-600 dark:text-slate-400 ml-11 font-medium">{subtitle}</p>
          )}
        </div>

        {/* RIGHT SIDE BADGE */}
        {showLive && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Live</span>
          </div>
        )}
      </div>
    </div>
  );
};
