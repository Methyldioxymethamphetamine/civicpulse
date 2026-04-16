'use client';

import Link from 'next/link';
import { usePendingReview } from '@/lib/queries';
import AdminReviewCard from '@/components/AdminReviewCard';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { data: pendingReports, isLoading, error } = usePendingReview();

  return (
    <div className="min-h-screen bg-[var(--civic-bg)] flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-4 px-4 py-3 border-b border-white/6 bg-[var(--civic-surface)]">
        <Link href="/" className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={14} className="text-slate-400" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Pending Approvals
            </p>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-12 bg-grid">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading pending reviews…</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm glass flex flex-col items-center gap-2">
              <span className="font-bold">Failed to load reviews</span>
              <span className="text-red-300/80 font-mono text-xs">{error?.message || String(error)}</span>
            </div>
          ) : pendingReports && pendingReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReports.map((report) => (
                 <AdminReviewCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-24 glass rounded-2xl">
              <ShieldCheck size={40} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                All Caught Up
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                There are currently no reports awaiting admin approval. Good job!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
