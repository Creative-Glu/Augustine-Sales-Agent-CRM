import { BellIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 bg-white shadow-sm z-10"
      style={{ marginLeft: 288 }}
    >
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-purplecrm-700">Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <BellIcon className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purplecrm-600 flex items-center justify-center text-white">
            A
          </div>
          <div className="text-sm">
            <div className="font-medium">Admin</div>
            <div className="text-xs text-slate-400">admin@augustine.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
