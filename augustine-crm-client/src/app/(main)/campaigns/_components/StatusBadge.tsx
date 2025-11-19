import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export const statusColors: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-700',
  Active: 'bg-blue-100 text-blue-700',
  Running: 'bg-green-100 text-green-700',
  AFA: 'bg-purple-100 text-purple-700',
  Stopped: 'bg-red-100 text-red-700',
  Default: 'bg-gray-100 text-gray-700', // fallback for unknown statuses
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || statusColors['Default'];

  return (
    <span
      className={cn('text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap', colorClass)}
    >
      {status}
    </span>
  );
}
