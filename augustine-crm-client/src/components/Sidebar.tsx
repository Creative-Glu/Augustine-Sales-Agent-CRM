'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SIDEBAR_GROUPS } from '../constants/sidebarLinks';
import { ArrowRightOnRectangleIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  /** Check if a link is active — exact match or starts-with for nested routes. */
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'));

  const toggleCollapsible = (title: string) =>
    setOpenCollapsibles((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 to-gray-950 text-white flex flex-col border-r border-slate-700/40 shadow-2xl">
      {/* ── Brand Section ── */}
      <div className="px-5 pt-6 pb-5">
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

      <div className="h-px bg-gradient-to-r from-slate-800/0 via-slate-700/40 to-slate-800/0 mx-4" />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-6 pb-2 custom-scrollbar">
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? 'mt-6' : ''}>
            {group.collapsible ? (
              /* ── Collapsible "Others" group ── */
              <>
                <button
                  type="button"
                  onClick={() => toggleCollapsible(group.title)}
                  className="group relative flex w-full items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 transition-all duration-200"
                >
                  {group.collapsibleIcon && (
                    <group.collapsibleIcon className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-slate-300 transition-all duration-200" />
                  )}
                  <span className="truncate flex-1 text-left">{group.title}</span>
                  {openCollapsibles[group.title] ? (
                    <ChevronDownIcon className="w-4 h-4 text-slate-500 transition-all duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-slate-500 transition-all duration-200" />
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
                      <div className="mt-1 ml-3 pl-3 space-y-1">
                        {group.links.map(({ href, label, icon: Icon }) => (
                          <div
                            key={href}
                            title="Deprecated"
                            className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed select-none opacity-50"
                          >
                            <Icon className="w-4 h-4 shrink-0 text-slate-600" />
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
                <p className="px-3 mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 select-none opacity-70">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.links.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            active
                              ? 'bg-gradient-to-r from-blue-600/25 to-blue-600/10 text-blue-300 shadow-lg shadow-blue-500/10'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                          }`}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-blue-500 shadow-lg shadow-blue-500/50"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        <Icon
                          className={`w-5 h-5 shrink-0 transition-all duration-200 ${
                            active ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate flex-1">{label}</span>

                        {/* Animated arrow on hover */}
                        {!active && (
                          <ChevronRightIcon className="w-4 h-4 text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
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

      {/* ── Footer Section ── */}
      <div className="border-t border-slate-700/40 px-3 py-4 bg-gradient-to-t from-slate-950/50 to-transparent">
        {user && (
          <div className="flex items-center gap-3 px-3 mb-4 pb-4 border-b border-slate-700/30">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg shadow-blue-500/30">
              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-100 truncate leading-tight">
                {user.full_name || 'User'}
              </p>
              <p className="text-xs text-white truncate leading-tight">{user.role}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-700/60 bg-slate-800/30 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer group"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 transition-colors duration-200 group-hover:text-red-400" />
          Sign out
        </button>

        <p className="text-center text-[10px] text-slate-600 mt-3">v0.1.0</p>
      </div>
    </aside>
  );
}
