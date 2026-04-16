'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Report } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Upload, Loader2, CheckCircle2, Camera, X, Play, ArrowLeft, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { useMarkResolved, useStartProgress } from '@/lib/queries';
import { toast } from 'sonner';

// Dynamically import the map so it only loads client-side (leaflet needs window)
const LocationMiniMap = dynamic(() => import('./LocationMiniMap'), { ssr: false });

interface WorkerTaskCardProps {
  report: Report;
}

export default function WorkerTaskCard({ report }: WorkerTaskCardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [fixFile, setFixFile] = useState<File | null>(null);
  const [fixPreview, setFixPreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState(false);
  const { mutateAsync: markResolved, isPending: isResolving } = useMarkResolved();
  const { mutateAsync: startProgress, isPending: isStarting } = useStartProgress();

  const handleFixImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFixFile(file);
    setFixPreview(URL.createObjectURL(file));
  };

  const handleResolve = async () => {
    if (!fixFile) { toast.error('Please upload a "fixed" photo first.'); return; }
    try {
      await markResolved({ reportId: report.id, fixImageFile: fixFile });
      toast.success('Task marked as Treated! Waiting on Admin approval.');
      setShowUpload(false);
    } catch {
      toast.error('Failed to update. Please try again.');
    }
  };

  const handleStart = async () => {
    try {
      await startProgress(report.id);
      toast.success('Task marked as In-Progress!');
    } catch {
      toast.error('Failed to start task.');
    }
  };

  return (
    <>
      {/* Card */}
      <div className="glass glass-hover rounded-2xl overflow-hidden transition-all slide-up flex flex-col sm:flex-row shadow-lg shadow-black/20">
        {/* Before photo */}
        {report.image_url ? (
          <div 
            onClick={() => setExpandedImage(true)}
            className="relative w-full sm:w-48 md:w-56 aspect-video sm:aspect-auto shrink-0 border-b sm:border-b-0 sm:border-r border-white/6 cursor-pointer group overflow-hidden"
          >
            <Image src={report.image_url} alt="Issue" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
               <span className="text-white text-xs font-bold drop-shadow-md backdrop-blur-sm bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl shadow-black/50 flex items-center gap-1.5">
                 <Maximize2 size={12} />
                 Click to expand
               </span>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold backdrop-blur-sm shadow-sm shadow-black/50 z-20">
              BEFORE
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-48 md:w-56 aspect-video sm:aspect-auto bg-white/5 shrink-0 border-b sm:border-b-0 sm:border-r border-white/6 flex flex-col items-center justify-center p-4">
             <Camera size={24} className="text-slate-600 mb-2" />
             <p className="text-xs text-slate-500 font-medium">No photo</p>
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400/90 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                  {report.category}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium line-clamp-3">
                {report.description}
              </p>
            </div>
            <StatusBadge status={report.status} className="shrink-0 scale-90 origin-top-right" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-3 mt-1 bg-white/[0.02] p-2 rounded-lg border border-white/5 w-fit">
            <MapPin size={12} className="text-blue-400 shrink-0" />
            <span className="font-mono text-[11px] text-slate-400">
              {report.lat.toFixed(5)}, {report.long.toFixed(5)}
            </span>
          </div>

          {/* Admin note if exists */}
          {report.admin_note && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
              <p className="text-[10px] text-amber-500/80 mb-0.5 font-bold uppercase tracking-wider">Admin Feedback</p>
              <p className="text-xs text-amber-300 leading-relaxed">{report.admin_note}</p>
            </div>
          )}

          <div className="mt-auto pt-2">
            {/* Action Logic Pipeline */}
            {report.status === 'Pending' && !showUpload && !report.fix_image_url && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button 
                  onClick={handleStart} 
                  disabled={isStarting} 
                  className="btn-secondary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {isStarting ? <Loader2 size={14} className="animate-spin" /> : <Play size={12} className="fill-current" />}
                  Mark as In Progress
                </button>
                <button 
                  onClick={() => setShowUpload(true)} 
                  className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-500 text-white hover:bg-blue-400 border-none"
                >
                  <CheckCircle2 size={14} />
                  Mark as Done
                </button>
              </div>
            )}

            {report.status === 'In-Progress' && !report.fix_image_url && !showUpload && (
               <button
                 onClick={() => setShowUpload(true)}
                 className="btn-primary w-full py-2.5 mt-2 bg-blue-500 hover:bg-blue-400 text-white border-none shadow-md shadow-blue-900/20 text-xs"
               >
                 <Upload size={14} />
                 Upload Fix &amp; Mark as Done
               </button>
            )}

            {showUpload && (
              <div className="space-y-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Submit Evidence</p>
                <input
                  id={`worker-upload-${report.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleFixImage}
                  className="hidden"
                />
                {fixPreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-green-500/30">
                    <Image src={fixPreview} alt="Fix preview" fill className="object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-green-600/80 text-white text-[10px] font-bold shadow-sm shadow-black/50">
                      AFTER
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFixFile(null); setFixPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`worker-upload-${report.id}`}
                    className="cursor-pointer w-full py-4 rounded-xl border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center gap-2 hover:border-blue-500/60 hover:bg-blue-500/5 transition-all bg-black/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center mb-1">
                       <Camera size={18} className="text-blue-400" />
                    </div>
                    <span className="text-[13px] text-blue-300 font-bold">Capture &quot;Fixed&quot; state</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tap to upload</span>
                  </label>
                )}

                <div className="flex gap-2 pt-1 border-t border-white/5 mt-3">
                  <button
                    onClick={() => { setShowUpload(false); setFixFile(null); setFixPreview(null); }}
                    className="btn-secondary flex-1 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={isResolving || !fixFile}
                    className="btn-success flex-1 py-2 text-xs font-bold"
                  >
                    {isResolving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {isResolving ? 'Uploading…' : 'Submit Done'}
                  </button>
                </div>
              </div>
            )}

            {report.fix_image_url && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-2.5">
                <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                   <CheckCircle2 size={12} className="text-green-400" />
                </div>
                <p className="text-[11px] font-bold tracking-wide text-green-400">
                  MARKED AS DONE. AWAITING ADMIN.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Full-screen Lightbox with Image + Map ─── */}
      {expandedImage && report.image_url && (
        <div className="fixed inset-0 z-[100] bg-[#070b14]/95 backdrop-blur-2xl flex flex-col">
          {/* Top bar */}
          <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/6">
            <button
              onClick={() => setExpandedImage(false)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Back to Tasks</span>
            </button>

            <div className="flex items-center gap-3">
              <StatusBadge status={report.status} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg hidden sm:block">
                {report.category}
              </span>
            </div>

            <button
              onClick={() => setExpandedImage(false)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content: Image + Map side by side */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            {/* Left: Full Image */}
            <div className="flex-1 relative min-h-0 bg-black/40">
              <Image 
                src={report.image_url} 
                alt="Expanded Issue Evidence" 
                fill 
                className="object-contain p-2 sm:p-4" 
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-xl">
                📷 SUBMITTED EVIDENCE
              </div>
            </div>

            {/* Right: Location map + details */}
            <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/6 flex flex-col bg-[var(--civic-surface)] overflow-y-auto">
              {/* Map */}
              <div className="h-56 sm:h-64 lg:h-72 shrink-0 relative border-b border-white/6">
                <LocationMiniMap lat={report.lat} long={report.long} />
              </div>

              {/* Details panel */}
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Details</p>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <MapPin size={14} className="text-blue-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Coordinates</p>
                      <p className="font-mono text-sm text-slate-300">
                        {report.lat.toFixed(6)}, {report.long.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm text-slate-300 font-medium">{report.category}</p>
                    </div>
                    <div className="flex-1 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Reported</p>
                      <p className="text-sm text-slate-300 font-medium">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                {report.admin_note && (
                  <div className="px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                    <p className="text-[10px] text-amber-500/80 mb-1 font-bold uppercase tracking-wider">Admin Note</p>
                    <p className="text-xs text-amber-300 leading-relaxed">{report.admin_note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
