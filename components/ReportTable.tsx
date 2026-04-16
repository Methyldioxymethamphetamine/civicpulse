'use client';

import { useState, useMemo } from 'react';
import type { Report, ReportStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow, format } from 'date-fns';
import { ChevronUp, ChevronDown, Search, ExternalLink } from 'lucide-react';
import Image from 'next/image';

type SortKey = 'created_at' | 'status' | 'category';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: Array<ReportStatus | 'All'> = ['All', 'Pending', 'In-Progress', 'Resolved', 'Rejected'];

interface ReportTableProps {
  reports: Report[];
}

export default function ReportTable({ reports }: ReportTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filtered = useMemo(() => {
    let data = [...reports];
    if (statusFilter !== 'All') {
      data = data.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [reports, statusFilter, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const renderSortIcon = (k: SortKey) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="civic-input pl-9"
            placeholder="Search by description, category, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/4 border-white/8 text-slate-400 hover:border-white/15'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="text-xs text-slate-500">
        Showing <span className="text-slate-300 font-semibold">{filtered.length}</span> of{' '}
        <span className="text-slate-300 font-semibold">{reports.length}</span> reports
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => toggleSort('category')}
                >
                  <span className="flex items-center gap-1">Category {renderSortIcon('category')}</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => toggleSort('status')}
                >
                  <span className="flex items-center gap-1">Status {renderSortIcon('status')}</span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none"
                  onClick={() => toggleSort('created_at')}
                >
                  <span className="flex items-center gap-1">Submitted {renderSortIcon('created_at')}</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-white/4 hover:bg-white/3 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                    onClick={() => setSelectedReport(r)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {r.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.category}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {r.lat.toFixed(4)}, {r.long.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink size={14} className="text-slate-600 hover:text-blue-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="glass w-full max-w-lg rounded-2xl p-6 slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedReport.category}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Report Details</h3>
              </div>
              <StatusBadge status={selectedReport.status} />
            </div>

            {selectedReport.image_url && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border border-white/10">
                <Image src={selectedReport.image_url} alt="Report image" fill className="object-cover" />
              </div>
            )}

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">{selectedReport.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-white/4 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Submitted</p>
                <p className="text-slate-200 font-medium">
                  {format(new Date(selectedReport.created_at), 'PPp')}
                </p>
              </div>
              <div className="bg-white/4 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Coordinates</p>
                <p className="text-slate-200 font-mono">
                  {selectedReport.lat.toFixed(5)}, {selectedReport.long.toFixed(5)}
                </p>
              </div>
              {selectedReport.admin_note && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 col-span-2">
                  <p className="text-amber-400/70 mb-1">Admin Note</p>
                  <p className="text-amber-300">{selectedReport.admin_note}</p>
                </div>
              )}
            </div>

            <button className="btn-secondary w-full" onClick={() => setSelectedReport(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
