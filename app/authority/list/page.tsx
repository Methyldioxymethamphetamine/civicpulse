'use client';

import { useReports } from '@/lib/queries';
import AuthorityListView from '@/components/AuthorityListView';
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
    <div className="h-full slide-up">
      <AuthorityListView reports={reports || []} />
    </div>
  );
}
