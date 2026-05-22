interface TabButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  count: number;
  label: string;
}

export function TabButton({ active, disabled, onClick, count, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${
        active ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
      } ${disabled ? 'hover:bg-transparent' : ''}`}
    >
      {label}
      <span
        className={`tabular-nums rounded-full px-1.5 py-0 text-[10px] ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
