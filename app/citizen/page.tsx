import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Camera, MapPin, AlertCircle } from 'lucide-react';
import ReportForm from '@/components/ReportForm';

export const metadata: Metadata = {
  title: 'Report an Issue — CivicPulse',
  description: 'Report public infrastructure issues anonymously. No login required.',
};

export default function CitizenPage() {
  return (
    <div className="relative min-h-screen bg-grid overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 pt-6 pb-4 flex items-center gap-4">
          <Link href="/" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-slate-400" />
          </Link>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Citizen Portal</p>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Report an Issue
            </h1>
          </div>
        </header>

        {/* Hero banner */}
        <div className="mx-4 mb-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/20 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Camera size={22} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-1">Anonymous Reporting</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                No account needed. Snap a photo, drop your location, describe the issue — done in 30 seconds.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
              <Camera size={11} /> Photo Evidence
            </span>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <MapPin size={11} /> GPS Location
            </span>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400">
              <AlertCircle size={11} /> Anonymous
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="mx-4 mb-8 glass rounded-2xl p-5">
          <ReportForm />
        </div>
      </div>
    </div>
  );
}
