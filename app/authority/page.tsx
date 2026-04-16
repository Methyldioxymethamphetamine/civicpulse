'use client';

import { useReports } from '@/lib/queries';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const IncidentMap = dynamic(() => import('@/components/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3">
      <Loader2 size={24} className="text-blue-500 animate-spin" />
      <p className="text-sm text-slate-400">Loading Map Engine…</p>
    </div>
  ),
});

export default function AuthorityMapPage() {
  const { data: reports, isLoading, error } = useReports();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading map data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
        <p>Failed to load reports.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative slide-up">
      <IncidentMap reports={reports || []} />
    </div>
  );
}
