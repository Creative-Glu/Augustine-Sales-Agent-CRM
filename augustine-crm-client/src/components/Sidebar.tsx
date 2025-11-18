'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { SignedIn, SignOutButton, UserButton, UserProfile, useUser } from '@clerk/nextjs';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 text-sidebar-foreground flex flex-col shadow-lg border-r"
      style={{ borderColor: 'var(--sidebar-border)' }}
    >
      {/* Brand Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <h1 className="text-2xl font-bold tracking-wide text-primary">Augustine</h1>
        <p className="text-sm mt-1 text-textColor">Sales & Leads</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-mentestack-blue text-white font-semibold'
                  : 'text-black hover:bg-gray-500 hover:text-primary-foreground'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-black group-hover:text-white'
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t flex items-center flex-col gap-3"
        style={{ borderColor: 'var(--sidebar-border)', color: 'var(--muted-foreground)' }}
      >
        {user && (
          <>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.fullName || 'User'}</p>
              <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </>
        )}

        <SignOutButton>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-primary-light transition"
            aria-label="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
