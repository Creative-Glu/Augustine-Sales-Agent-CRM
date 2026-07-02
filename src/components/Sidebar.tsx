'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SIDEBAR_GROUPS } from '../constants/sidebarLinks';
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { ThemeToggle } from './ThemeToggle';

const SIDEBAR_STATE_KEY = 'augustine.sidebar.collapsibles';

function readPersistedCollapsibles(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openCollapsibles, setOpenCollapsibles] =
    useState<Record<string, boolean>>(readPersistedCollapsibles);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(openCollapsibles));
    } catch {
      // ignore
    }
  }, [openCollapsibles]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'));

  const toggleCollapsible = (title: string) =>
    setOpenCollapsibles((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 text-white flex flex-col border-r border-slate-800 shadow-2xl">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="block">
          <Image
            src="/augustine-logo.png"
            alt="Augustine Institute"
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent mx-4" />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-2 custom-scrollbar">
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? 'mt-5' : ''}>
            {group.collapsible ? (
              /* ── Collapsible group (legacy "Others" deprecated) ── */
              <>
                <button
                  type="button"
                  onClick={() => toggleCollapsible(group.title)}
                  className="group relative flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {group.collapsibleIcon && (
                    <group.collapsibleIcon className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-white transition-colors" />
                  )}
                  <span className="truncate flex-1 text-left">{group.title}</span>
                  {openCollapsibles[group.title] ? (
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {openCollapsibles[group.title] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 ml-3 pl-3 space-y-1 border-l border-slate-800">
                        {group.links.map(({ href, label, icon: Icon }) => (
                          <div
                            key={href}
                            title="Deprecated"
                            className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed select-none opacity-60"
                          >
                            <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                            <span className="truncate flex-1">{label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* ── Regular group ── */
              <>
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.links.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-linear-to-r from-blue-600/30 to-blue-600/10 text-white shadow-sm'
                            : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-linear-to-b from-blue-400 to-blue-500 shadow-sm shadow-blue-500/40"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            active ? 'text-blue-300' : 'text-slate-300 group-hover:text-white'
                          }`}
                        />
                        <span className="truncate flex-1">{label}</span>
                        {!active && (
                          <ChevronRightIcon className="w-4 h-4 text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer: appearance / theme toggle ── */}
      <div className="border-t border-slate-800 px-4 py-4 bg-linear-to-t from-slate-950/60 to-transparent">
        <p className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
          Appearance
        </p>
        <ThemeToggle className="w-full" />
      </div>

      {/* ── Footer ── only sign-out + version ── */}
      {/* <div className="border-t border-slate-800 px-3 py-3 bg-linear-to-t from-slate-950/60 to-transparent">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-slate-800/40 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-rose-500/15 hover:border-rose-500/40 transition-colors cursor-pointer group"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 transition-colors group-hover:text-rose-300" />
          Sign out
        </button>
        <p className="text-center text-[10px] text-slate-500 mt-2">v0.1.0</p>
      </div> */}
    </aside>
  );
}
