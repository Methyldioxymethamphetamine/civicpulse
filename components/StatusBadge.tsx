import { type ReportStatus, STATUS_BG } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<ReportStatus, string> = {
  Pending: 'bg-red-400',
  'In-Progress': 'bg-amber-400',
  Resolved: 'bg-green-400',
  Rejected: 'bg-gray-400',
};

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', STATUS_BG[status], className)}>
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />
      {status}
    </span>
  );
}
