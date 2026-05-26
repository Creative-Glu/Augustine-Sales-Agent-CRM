'use client';

import { ReactNode, memo } from 'react';
import UserBadge from './UserBadge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  showLive?: boolean;
}

const HeaderComponent = ({ title, subtitle = '', icon, showLive = true }: HeaderProps) => {
  return (
    <div className="sticky p-0 top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between py-2 min-h-0px]">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <div className="flex items-center jus gap-3 ">
            {/* Icon Container */}
            {icon && (
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                {icon}
              </div>
            )}

            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {title}
            </h3>
          </div>

          {subtitle && (
            <span className="text-slate-600 dark:text-slate-400 ml-13 font-normal">{subtitle}</span>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="z-40 flex-shrink-0">
          <MemoizedUserBadge />
        </div>

        {/* LIVE BADGE */}
        {/* {showLive && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Live
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
};

const MemoizedUserBadge = memo(UserBadge);

export const Header = memo(HeaderComponent);
