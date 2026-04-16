'use client';

import { useState } from 'react';
import type { Report } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useApproveReport, useReassignReport } from '@/lib/queries';
import { toast } from 'sonner';

interface AdminReviewCardProps {
  report: Report;
}

export default function AdminReviewCard({ report }: AdminReviewCardProps) {
  const [showReassign, setShowReassign] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const { mutateAsync: approve, isPending: approving } = useApproveReport();
  const { mutateAsync: reassign, isPending: reassigning } = useReassignReport();

  const handleApprove = async () => {
    try {
      await approve(report.id);
      toast.success('Report approved and closed!');
    } catch {
      toast.error('Failed to approve. Please try again.');
    }
  };

  const handleReassign = async () => {
    if (!adminNote.trim()) { toast.error('Please add a feedback note.'); return; }
    try {
      await reassign({ reportId: report.id, adminNote });
      toast.success('Report reassigned with feedback.');
      setShowReassign(false);
      setAdminNote('');
    } catch {
      toast.error('Failed to reassign. Please try again.');
    }
  };

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden slide-up">
      {/* Before / After photos */}
      <div className="grid grid-cols-2 border-b border-white/6">
        <div className="relative aspect-video border-r border-white/6">
          {report.image_url ? (
            <Image src={report.image_url} alt="Before" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/3">
              <span className="text-xs text-slate-600">No photo</span>
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600/80 text-white text-xs font-bold">
            BEFORE
          </div>
        </div>
        <div className="relative aspect-video">
          {report.fix_image_url ? (
            <Image src={report.fix_image_url} alt="After" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/3">
              <span className="text-xs text-slate-600">No fix photo</span>
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-green-600/80 text-white text-xs font-bold">
            AFTER
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {report.category}
            </span>
            <h3 className="text-sm font-semibold text-white mt-0.5 leading-relaxed">
              {report.description}
            </h3>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })} ·{' '}
          <span className="font-mono">{report.lat.toFixed(4)}, {report.long.toFixed(4)}</span>
        </p>

        {/* Reassign note input */}
        {showReassign && (
          <div className="mb-4 space-y-2 slide-up">
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
              <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">Provide clear feedback so the worker knows what to fix.</p>
            </div>
            <textarea
              className="civic-input resize-none text-sm"
              rows={3}
              placeholder="e.g., 'Repair is incomplete — the pothole edge is still exposed and needs sealing.'"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              maxLength={300}
            />
            <p className="text-xs text-slate-500 text-right">{adminNote.length}/300</p>
          </div>
        )}

        {/* Action buttons */}
        {showReassign ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowReassign(false); setAdminNote(''); }}
              className="btn-secondary flex-1"
              style={{ padding: '10px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={reassigning || !adminNote.trim()}
              className="btn-danger flex-1"
              style={{ padding: '10px' }}
            >
              {reassigning ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {reassigning ? 'Reassigning…' : 'Send Back'}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setShowReassign(true)}
              className="btn-danger flex-1"
              style={{ padding: '12px' }}
            >
              <RefreshCw size={15} />
              Reassign
            </button>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="btn-success flex-1"
              style={{ padding: '12px' }}
            >
              {approving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {approving ? 'Approving…' : 'Approve & Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
