'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useReports } from '@/lib/queries';
import { ArrowLeft, ShieldCheck, Loader2, MapPin, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Report, ReportStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

const AdminDetailModal = dynamic(() => import('@/components/AdminDetailModal'), { ssr: false });

type FilterType = 'All' | 'Pending' | 'In-Progress' | 'Treated' | 'Resolved';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'civicpulse';

/* ─── Login Gate ─────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin-auth') === '1') setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const user = (form.elements.namedItem('username') as HTMLInputElement).value;
    const pass = (form.elements.namedItem('password') as HTMLInputElement).value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin-auth', '1');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="relative min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
        <div className="relative z-10 glass-frost max-w-sm w-full p-8 text-center rounded-3xl shadow-2xl shadow-black/50 border border-white/10 slide-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin Access
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your credentials to access the admin panel.
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 text-left">
            <input type="text" name="username" placeholder="Username" required className="civic-input" autoComplete="username" />
            <input type="password" name="password" placeholder="Password" required className="civic-input" autoComplete="current-password" />
            {loginError && (
              <p className="text-xs text-red-400 font-medium px-1">{loginError}</p>
            )}
            <button type="submit" className="btn-primary w-full mt-2">
              Login to Admin Panel
            </button>
          </form>
          <Link href="/" className="inline-block mt-5 text-sm text-slate-500 hover:text-white transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

/* ─── Dashboard (shown after login) ──────────────────────────────────────── */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: allReports, isLoading, error } = useReports();
  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports = allReports?.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return r.status === 'Pending';
    if (filter === 'In-Progress') return r.status === 'In-Progress' && !r.fix_image_url;
    if (filter === 'Treated') return r.status === 'In-Progress' && !!r.fix_image_url;
    if (filter === 'Resolved') return r.status === 'Resolved';
    return true;
  });

  const getDisplayStatus = (r: Report): ReportStatus => {
    if (r.status === 'In-Progress' && r.fix_image_url) return 'Treated';
    return r.status;
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'In-Progress', label: 'In-Progress' },
    { key: 'Treated', label: 'Marked as Done' },
    { key: 'Resolved', label: 'Resolved' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-4 px-4 py-3 glass-header">
        <Link href="/" className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={14} className="text-slate-400" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin Panel
          </p>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {reports && (
            <span className="text-[11px] font-bold text-slate-500">
              {reports.length} report{reports.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-grid">
        <div className="max-w-5xl mx-auto">

          {/* Filters */}
          <div className="flex gap-2 p-1.5 glass rounded-xl mb-6 w-full max-w-fit mx-auto sm:mx-0 overflow-x-auto scroller-hidden">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === key ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading reports…</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm glass flex flex-col items-center gap-2 rounded-2xl">
              <span className="font-bold">Failed to load reports</span>
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="text-left glass glass-hover rounded-2xl overflow-hidden slide-up cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 active:scale-[0.98]"
                >
                  {/* Thumbnail */}
                  {report.image_url && report.fix_image_url ? (

                    <div className="relative grid grid-cols-2 aspect-[16/10] border-b border-white/6">
                      <div className="relative overflow-hidden">
                        <Image src={report.image_url} alt="Before" fill className="object-cover" unoptimized />
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-600/80 text-white text-[8px] font-bold">BEFORE</div>
                      </div>
                      <div className="relative overflow-hidden border-l border-white/10">
                        <Image src={report.fix_image_url} alt="After" fill className="object-cover" unoptimized />
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-green-600/80 text-white text-[8px] font-bold">AFTER</div>
                      </div>
                      {/* Center divider icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-[9px] text-white font-bold">VS</span>
                        </div>
                      </div>
                    </div>
                  ) : report.image_url ? (
                    <div className="relative aspect-[16/10] border-b border-white/6">
                      <Image src={report.image_url} alt="Report" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] border-b border-white/6 bg-white/[0.02] flex items-center justify-center">
                      <span className="text-xs text-slate-600">No photo</span>
                    </div>
                  )}

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          {report.category}
                        </span>
                        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mt-0.5">
                          {report.description}
                        </h3>
                      </div>
                      <StatusBadge status={getDisplayStatus(report)} className="shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                      <span>·</span>
                      <MapPin size={9} />
                      <span className="font-mono">{report.lat.toFixed(3)}, {report.long.toFixed(3)}</span>
                    </div>

                    {/* Resolved indicator */}
                    {report.status === 'Resolved' && (
                      <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">Resolved</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-24 glass rounded-2xl">
              <ShieldCheck size={40} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                No Reports Found
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {filter === 'All'
                  ? 'There are currently no reports in the system.'
                  : `No reports match the "${filter === 'Treated' ? 'Marked as Done' : filter}" filter.`}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedReport && (
        <AdminDetailModal
          report={selectedReport}
          displayStatus={getDisplayStatus(selectedReport)}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
