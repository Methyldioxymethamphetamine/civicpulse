'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Report } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import {
  X, MapPin, Clock, Tag, FileText, CheckCircle2, RefreshCw,
  Loader2, AlertTriangle, ZoomIn, ChevronLeft, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { useApproveReport, useReassignReport } from '@/lib/queries';
import { toast } from 'sonner';
import type { ReportStatus } from '@/lib/types';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

interface Props {
  report: Report;
  displayStatus: ReportStatus;
  onClose: () => void;
}

export default function AdminDetailModal({ report, displayStatus, onClose }: Props) {
  const [showReassign, setShowReassign] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [activeImage, setActiveImage] = useState<'before' | 'after'>('before');
  const { mutateAsync: approve, isPending: approving } = useApproveReport();
  const { mutateAsync: reassign, isPending: reassigning } = useReassignReport();

  const isTreated = displayStatus === 'Treated';
  const hasBeforeImage = !!report.image_url;
  const hasAfterImage = !!report.fix_image_url;
  const hasBothImages = hasBeforeImage && hasAfterImage;

  const handleApprove = async () => {
    try {
      await approve(report.id);
      toast.success('Report approved and resolved!');
      onClose();
    } catch {
      toast.error('Failed to approve.');
    }
  };

  const handleReassign = async () => {
    if (!adminNote.trim()) { toast.error('Please add a feedback note.'); return; }
    try {
      await reassign({ reportId: report.id, adminNote });
      toast.success('Report rejected and sent back.');
      onClose();
    } catch {
      toast.error('Failed to reassign.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="glass-frost w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden flex flex-col slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <StatusBadge status={displayStatus} />
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{report.category}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image viewer */}
          {(hasBeforeImage || hasAfterImage) && (
            <div className="relative">
              {/* Active image */}
              <div className="relative w-full aspect-[16/9] bg-black/40">
                {activeImage === 'before' && hasBeforeImage && (
                  <Image src={report.image_url!} alt="Before" fill className="object-contain" />
                )}
                {activeImage === 'after' && hasAfterImage && (
                  <Image src={report.fix_image_url!} alt="After" fill className="object-contain" />
                )}

                {/* Image label */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-bold text-white ${
                  activeImage === 'before' ? 'bg-red-600/80' : 'bg-green-600/80'
                }`}>
                  {activeImage === 'before' ? 'BEFORE (Reported)' : 'AFTER (Fix Uploaded)'}
                </div>

                {/* Nav arrows if both images */}
                {hasBothImages && (
                  <>
                    <button
                      onClick={() => setActiveImage('before')}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        activeImage === 'before' ? 'bg-white/5 text-slate-600' : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveImage('after')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        activeImage === 'after' ? 'bg-white/5 text-slate-600' : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {hasBothImages && (
                <div className="flex gap-2 p-3 border-b border-white/6 bg-black/20">
                  <button
                    onClick={() => setActiveImage('before')}
                    className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === 'before' ? 'border-red-500 ring-1 ring-red-500/30' : 'border-white/10 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <Image src={report.image_url!} alt="Before thumb" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-[8px] font-bold text-white">BEFORE</div>
                  </button>
                  <button
                    onClick={() => setActiveImage('after')}
                    className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === 'after' ? 'border-green-500 ring-1 ring-green-500/30' : 'border-white/10 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <Image src={report.fix_image_url!} alt="After thumb" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-[8px] font-bold text-white">AFTER</div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Details section */}
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                <FileText size={12} />
                <span className="font-semibold uppercase tracking-wider">Description</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{report.description}</p>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Clock size={11} />
                  <span className="font-semibold">Reported</span>
                </div>
                <p className="text-sm text-white font-medium">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Tag size={11} />
                  <span className="font-semibold">Category</span>
                </div>
                <p className="text-sm text-white font-medium">{report.category}</p>
              </div>
            </div>

            {/* Location + Mini Map */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <MapPin size={12} />
                <span className="font-semibold uppercase tracking-wider">Location</span>
                <span className="font-mono text-slate-400 ml-auto text-[11px]">
                  {report.lat.toFixed(5)}, {report.long.toFixed(5)}
                </span>
              </div>
              <div className="h-40 rounded-xl overflow-hidden border border-white/8">
                <MiniMap lat={report.lat} lng={report.long} />
              </div>
            </div>

            {/* Admin note if rejected previously */}
            {report.admin_note && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-300 mb-0.5">Previous Admin Note</p>
                  <p className="text-xs text-amber-200/70">{report.admin_note}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action footer — only for Treated reports */}
        {isTreated && (
          <div className="shrink-0 border-t border-white/8 p-5">
            {showReassign ? (
              <div className="space-y-3 slide-up">
                <textarea
                  className="civic-input resize-none text-sm"
                  rows={2}
                  placeholder="Why is this being rejected? Give feedback to the worker…"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  maxLength={300}
                  autoFocus
                />
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
                    {reassigning ? 'Sending…' : 'Reject & Send Back'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReassign(true)}
                  className="btn-danger flex-1 py-3 text-sm font-bold rounded-xl"
                >
                  <RefreshCw size={15} />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="btn-success flex-1 py-3 text-sm font-bold rounded-xl"
                >
                  {approving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {approving ? 'Approving…' : 'Approve & Resolve'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resolved confirmation */}
        {report.status === 'Resolved' && (
          <div className="shrink-0 border-t border-white/8 p-5">
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Approved &amp; Resolved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
