'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  ImageIcon,
  Layers,
  Calendar,
  Tag,
  Navigation,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Report } from '@/lib/types';
import { STATUS_BG, STATUS_COLORS } from '@/lib/types';
import { useVoteReport } from '@/lib/queries';

const MiniMap = dynamic(() => import('@/components/MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-white/[0.02] rounded-xl">
      <span className="text-[10px] text-slate-600 animate-pulse">Loading map…</span>
    </div>
  ),
});

/* ─── Null-safe score helpers ─────────────────────────────────────────────── */
const safeUp = (r: Report) => r.upvotes ?? 0;
const safeDown = (r: Report) => r.downvotes ?? 0;
const netScore = (r: Report) => safeUp(r) - safeDown(r);

/* ─── Haversine distance (metres) ─────────────────────────────────────────── */
function haversine(a: Report, b: Report): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.long - a.long);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/* ─── Proximity clustering (~500 m radius) ────────────────────────────────── */
interface Cluster {
  label: string;
  lat: number;
  long: number;
  reports: Report[];
  topScore: number;
}

function clusterReports(reports: Report[], radiusM = 500): Cluster[] {
  const used = new Set<string>();
  const clusters: Cluster[] = [];

  const sorted = [...reports].sort(
    (a, b) => netScore(b) - netScore(a)
  );

  for (const seed of sorted) {
    if (used.has(seed.id)) continue;
    used.add(seed.id);

    const members: Report[] = [seed];

    for (const candidate of sorted) {
      if (used.has(candidate.id)) continue;
      if (haversine(seed, candidate) <= radiusM) {
        members.push(candidate);
        used.add(candidate.id);
      }
    }

    members.sort(
      (a, b) => netScore(b) - netScore(a)
    );

    const avgLat = members.reduce((s, r) => s + r.lat, 0) / members.length;
    const avgLong = members.reduce((s, r) => s + r.long, 0) / members.length;
    const topScore = netScore(members[0]);

    clusters.push({
      label:
        members.length > 1
          ? `${members[0].category} area · ${members.length} reports`
          : members[0].category,
      lat: avgLat,
      long: avgLong,
      reports: members,
      topScore,
    });
  }

  clusters.sort((a, b) => b.topScore - a.topScore);
  return clusters;
}

/* ─── LocalStorage vote tracker ───────────────────────────────────────────── */
function getVoteState(reportId: string): 'up' | 'down' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`vote-${reportId}`) as 'up' | 'down' | null;
}

function setVoteState(reportId: string, dir: 'up' | 'down') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`vote-${reportId}`, dir);
}

/* ─── Expanded detail panel ───────────────────────────────────────────────── */
function ExpandedDetails({ report, onClose }: { report: Report; onClose: () => void }) {
  const statusColor = STATUS_COLORS[report.status] || '#94a3b8';

  return (
    <div
      className="overflow-hidden transition-all duration-400 ease-out"
      style={{ animation: 'expandIn 0.35s ease-out forwards' }}
    >
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        {/* ── Two-column layout: Image + Map ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Enlarged image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
            {report.image_url ? (
              <Image
                src={report.image_url}
                alt={report.category}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <ImageIcon size={32} className="text-slate-700" />
                <span className="text-[11px] text-slate-600">No photo attached</span>
              </div>
            )}
          </div>

          {/* Mini map */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.06]">
            <MiniMap lat={report.lat} lng={report.long} />
            {/* Location overlay */}
            <div className="absolute bottom-2 left-2 right-2 z-[400]">
              <div className="glass rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <Navigation size={10} className="text-blue-400 shrink-0" />
                <span className="text-[10px] text-slate-300 font-mono truncate">
                  {report.lat.toFixed(6)}, {report.long.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail metadata grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {/* Category */}
          <div className="glass rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Tag size={10} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Category</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">{report.category}</span>
          </div>

          {/* Status */}
          <div className="glass rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Status</span>
            </div>
            <span className={`text-xs font-semibold`} style={{ color: statusColor }}>
              {report.status}
            </span>
          </div>

          {/* Created */}
          <div className="glass rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={10} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Reported</span>
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {format(new Date(report.created_at), 'MMM d, yyyy')}
            </span>
            <span className="text-[10px] text-slate-500">
              {format(new Date(report.created_at), 'h:mm a')}
            </span>
          </div>

          {/* Votes */}
          <div className="glass rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <ChevronUp size={10} className="text-slate-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Votes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">▲ {safeUp(report)}</span>
              <span className="text-xs font-semibold text-red-400">▼ {safeDown(report)}</span>
            </div>
          </div>
        </div>

        {/* ── Full description ── */}
        <div className="glass rounded-xl p-3 mb-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Description</p>
          <p className="text-sm text-slate-200 leading-relaxed">{report.description}</p>
        </div>

        {/* ── Admin note (if any) ── */}
        {report.admin_note && (
          <div className="glass rounded-xl p-3 mb-3 border-l-2 border-amber-500/40">
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/80 mb-1.5">Admin Note</p>
            <p className="text-sm text-slate-300 leading-relaxed">{report.admin_note}</p>
          </div>
        )}

        {/* ── Close button ── */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
        >
          <X size={12} />
          Collapse
        </button>
      </div>
    </div>
  );
}

/* ─── Single report card ──────────────────────────────────────────────────── */
function ReportCard({ report }: { report: Report }) {
  const voteMutation = useVoteReport();
  const [localVote, setLocalVote] = useState<'up' | 'down' | null>(() =>
    getVoteState(report.id)
  );
  const [expanded, setExpanded] = useState(false);

  const score = netScore(report);

  const handleVote = useCallback(
    (dir: 'up' | 'down') => {
      if (localVote === dir) return;
      setLocalVote(dir);
      setVoteState(report.id, dir);
      voteMutation.mutate({ reportId: report.id, direction: dir });
    },
    [localVote, report.id, voteMutation]
  );

  return (
    <div
      className={`group rounded-2xl glass transition-all duration-300 ${
        expanded
          ? 'shadow-xl shadow-black/30 border-white/[0.1]'
          : 'glass-hover hover:-translate-y-0.5'
      }`}
    >
      {/* ── Compact row (always visible) ── */}
      <div
        className="flex gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Vote column — stop propagation so clicking vote doesn't toggle expand */}
        <div
          className="flex flex-col items-center gap-0.5 min-w-[44px] select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id={`upvote-${report.id}`}
            onClick={() => handleVote('up')}
            aria-label="Upvote"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              localVote === 'up'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10 scale-110'
                : 'bg-white/[0.03] text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400'
            }`}
          >
            <ChevronUp size={18} strokeWidth={2.5} />
          </button>

          <span
            className={`text-sm font-bold tabular-nums leading-none py-1 ${
              score > 0
                ? 'text-emerald-400'
                : score < 0
                ? 'text-red-400'
                : 'text-slate-500'
            }`}
          >
            {score}
          </span>

          <button
            id={`downvote-${report.id}`}
            onClick={() => handleVote('down')}
            aria-label="Downvote"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              localVote === 'down'
                ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10 scale-110'
                : 'bg-white/[0.03] text-slate-500 hover:bg-red-500/10 hover:text-red-400'
            }`}
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Thumbnail */}
        <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
          {report.image_url ? (
            <Image
              src={report.image_url}
              alt={report.category}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ImageIcon size={20} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                {report.category}
              </span>
              <span
                className={`status-badge text-[10px] px-2 py-0.5 ${
                  STATUS_BG[report.status]
                }`}
              >
                {report.status}
              </span>
            </div>
            {/* Expand indicator */}
            <div className={`shrink-0 w-5 h-5 rounded-lg bg-white/[0.04] flex items-center justify-center transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={12} className="text-slate-500" />
            </div>
          </div>

          <p className={`text-[13px] sm:text-sm text-slate-200 font-medium leading-snug mb-1.5 ${expanded ? '' : 'line-clamp-2'}`}>
            {report.description}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={10} />
              {report.lat.toFixed(4)}, {report.long.toFixed(4)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={10} />
              {formatDistanceToNow(new Date(report.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <ExpandedDetails report={report} onClose={() => setExpanded(false)} />
        </div>
      )}
    </div>
  );
}

/* ─── Main list view ──────────────────────────────────────────────────────── */
export default function AuthorityListView({
  reports,
}: {
  reports: Report[];
}) {
  const clusters = useMemo(() => clusterReports(reports), [reports]);

  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
        <Layers size={28} />
        <p className="text-sm">No reports yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 space-y-6 custom-scroll">
      {clusters.map((cluster, ci) => (
        <section key={ci}>
          {/* Cluster header — only show if > 1 report in cluster */}
          {cluster.reports.length > 1 && (
            <div className="flex items-center gap-2 mb-3 pl-1">
              <div className="w-2 h-2 rounded-full bg-violet-500/60 animate-pulse" />
              <span className="text-xs font-bold text-violet-400/80 uppercase tracking-wider">
                {cluster.label}
              </span>
              <span className="text-[10px] text-slate-600 ml-auto">
                ~{cluster.lat.toFixed(3)}, {cluster.long.toFixed(3)}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {cluster.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Separator between clusters */}
          {ci < clusters.length - 1 && (
            <div className="mt-5 border-t border-white/[0.04]" />
          )}
        </section>
      ))}
    </div>
  );
}
