'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <motion.aside
      // variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-700/50"
    >
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 border-b border-slate-700/50 bg-linear-to-r from-blue-600/10 to-cyan-600/10"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Bars3Icon className="w-5 h-5 text-white" />
          </div> */}
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Augustine
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest ml-11">
          Sales & Leads
        </p>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }, index) => {
          const isActive = pathname === href;
          return (
            <motion.div
              key={href}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                ${
                  isActive
                    ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {/* Animated background for hover state */}
                {!isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/10 transition-all duration-300" />
                )}

                {/* Icon */}
                <motion.div
                  whileHover={!isActive ? { scale: 1.1, rotate: 5 } : {}}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                </motion.div>

                {/* Label */}
                <span className="relative z-10 flex-1">{label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-2 h-2 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-linear-to-r from-slate-700/0 via-slate-700/50 to-slate-700/0" />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-t border-slate-700/50 bg-linear-to-t from-slate-950 to-slate-900"
      >
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-4 px-2 space-y-1"
          >
            <p className="text-sm font-semibold text-white truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <p className="text-[11px] text-slate-500">Role: {user.role}</p>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out
        </button>
      </motion.div>
    </motion.aside>
  );
}
