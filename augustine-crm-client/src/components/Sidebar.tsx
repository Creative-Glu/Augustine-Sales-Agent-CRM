'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_LINKS } from '../constants/sidebarLinks';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-900 flex flex-col shadow-lg border-r border-gray-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-purplecrm-700 tracking-wide">Augustine</h1>
        <p className="text-sm text-gray-500 mt-1">Sales & Leads</p>
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
                  ? 'bg-purplecrm-100 text-purplecrm-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-purplecrm-700'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-purplecrm-700' : 'text-gray-500 group-hover:text-purplecrm-700'
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
        <p>© 2025 Augustine CRM</p>
        <p className="mt-1 text-[11px] text-gray-400">Empowering Sales Teams</p>
      </div>
    </aside>
  );
}
