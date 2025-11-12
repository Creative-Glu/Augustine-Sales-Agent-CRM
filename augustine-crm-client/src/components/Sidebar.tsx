'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';
import { useRouter } from 'next/navigation';
import { signOut } from '@/src/lib/auth/session';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  function handleLogout() {
    try {
      signOut();
    } finally {
      router.push('/login');
    }
  }
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 text-sidebar-foreground flex flex-col shadow-lg border-r"
      style={{ borderColor: 'var(--sidebar-border)' }}
    >
      {/* Brand Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <h1 className="text-2xl font-bold tracking-wide text-primary">Augustine</h1>
        <p className="text-sm text-muted-foreground mt-1">Sales & Leads</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          console.log('isActive', isActive);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-mentestack-blue text-white font-semibold'
                  : 'text-black hover:bg-black hover:text-primary-foreground'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-black group-hover:text-primary'
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t text-xs"
        style={{ borderColor: 'var(--sidebar-border)', color: 'var(--muted-foreground)' }}
      >
        <p>© 2025 Augustine CRM</p>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          Empowering Sales Teams
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-primary-light cursor-pointer transition"
          aria-label="Sign out"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
