export type ReportStatus = 'Pending' | 'In-Progress' | 'Resolved' | 'Rejected' | 'Treated';

export interface Report {
  id: string;
  created_at: string;
  description: string;
  category: string;
  image_url: string | null;
  fix_image_url: string | null;
  status: ReportStatus;
  lat: number;
  long: number;
  worker_id: string | null;
  admin_note: string | null;
}

export const CATEGORIES = [
  'Pothole',
  'Broken Streetlight',
  'Damaged Sidewalk',
  'Flooding',
  'Graffiti',
  'Fallen Tree',
  'Garbage',
  'Water Leak',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUS_COLORS: Record<ReportStatus, string> = {
  Pending: '#ef4444',
  'In-Progress': '#f59e0b',
  Treated: '#06b6d4',
  Resolved: '#22c55e',
  Rejected: '#6b7280',
};

export const STATUS_BG: Record<ReportStatus, string> = {
  Pending: 'bg-red-500/15 text-red-400 border-red-500/30',
  'In-Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Treated: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
  Rejected: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};
