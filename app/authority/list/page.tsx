'use client';

import { useReports } from '@/lib/queries';
import ReportTable from '@/components/ReportTable';
import { Loader2 } from 'lucide-react';

export default function AuthorityListPage() {
  const { data: reports, isLoading, error } = useReports();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 min-h-[50vh]">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading reports list…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400 min-h-[50vh]">
        <p>⚠️ Failed to load reports.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Incident Directory
          </h2>
          <p className="text-sm text-slate-400">
            View, filter, and track all reported public infrastructure issues.
          </p>
        </div>

        <ReportTable reports={reports || []} />
      </div>
    </div>
  );
}
