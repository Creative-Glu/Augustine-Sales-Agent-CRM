'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, ShieldCheck, Mail, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Top-right user widget that shows avatar + name + role, and opens a small
 * dropdown menu on click. Used to live in the sidebar footer; moved into
 * the main layout so the sidebar stays focused on navigation.
 */
export default function UserBadge() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (!user) return null;

  const displayName = user.full_name || user.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 px-1.5 py-1 pr-3 shadow-sm cursor-pointer transition-colors"
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-blue-500 via-blue-600 to-cyan-500 text-white text-xs font-bold shadow-sm shrink-0"
          aria-hidden
        >
          {initial}
        </span>
        <span className="hidden sm:flex flex-col items-start min-w-0 max-w-40">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
            {user.role}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-linear-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-blue-950/20 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-blue-500 via-blue-600 to-cyan-500 text-white text-base font-bold shadow-sm shrink-0">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 py-3 space-y-1.5">
            <DetailRow
              icon={<ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
              label="Role"
              value={
                <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-300">
                  {user.role}
                </span>
              }
            />
            <DetailRow
              icon={<Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
              label="Email"
              value={
                <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate block max-w-40">
                  {user.email}
                </span>
              }
            />
            <DetailRow
              icon={<UserCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
              label="User ID"
              value={
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  #{user.id}
                </span>
              }
            />
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
                router.push('/login');
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-12 shrink-0">
        {label}
      </span>
      <span className="min-w-0 flex-1">{value}</span>
    </div>
  );
}
