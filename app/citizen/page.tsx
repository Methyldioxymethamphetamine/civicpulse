import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Camera, MapPin, AlertCircle, Shield } from 'lucide-react';
import ReportForm from '@/components/ReportForm';

export const metadata: Metadata = {
  title: 'Report an Issue — CivicPulse',
  description: 'Report public infrastructure issues anonymously. No login required.',
};

export default function CitizenPage() {
  return (
    <div className="relative h-screen bg-[var(--civic-bg)] overflow-hidden flex flex-col">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* M3 Top App Bar */}
      <header className="relative z-10 shrink-0 flex items-center justify-between px-4 lg:px-8 py-3 border-b border-white/6 bg-[var(--civic-surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            <ArrowLeft size={16} className="text-slate-400" />
          </Link>
          <div>
            <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.15em]">Citizen Portal</p>
            <h1 className="text-base font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Report an Issue
            </h1>
          </div>
        </div>

        {/* M3 Assist Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/8 border border-blue-500/15">
          <Shield size={12} className="text-blue-400" />
          <span className="text-[11px] text-blue-300/80 font-medium">Anonymous &middot; No login required</span>
        </div>
      </header>

      {/* Main Content — fits 16:9 viewport */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">

          {/* Left panel: Hero + info (desktop only, mobile stacks) */}
          <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 flex-col border-r border-white/6 bg-gradient-to-b from-blue-600/[0.04] to-transparent">
            {/* Branding area */}
            <div className="p-6 xl:p-8 flex flex-col gap-6 flex-1">
              <div className="flex-1 flex flex-col justify-center">
                {/* M3 Large display */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mb-5 shadow-xl shadow-blue-900/10">
                  <Camera size={28} className="text-blue-400" />
                </div>
                <h2 className="text-2xl xl:text-[28px] font-bold text-white leading-tight mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Snap. Pin. Report.
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  Capture infrastructure issues in your community anonymously. Your report goes directly to the response team.
                </p>

                {/* M3 Feature pills */}
                <div className="flex flex-col gap-2.5 mt-8">
                  {[
                    { icon: Camera, label: 'Photo Evidence', desc: 'Attach visual proof', color: 'blue' },
                    { icon: MapPin, label: 'GPS Location', desc: 'Auto-pinned on map', color: 'cyan' },
                    { icon: AlertCircle, label: 'Anonymous', desc: 'No account needed', color: 'slate' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                      <div className={`w-9 h-9 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/15 flex items-center justify-center shrink-0`}>
                        <item.icon size={16} className={`text-${item.color}-400`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom stat */}
              <div className="rounded-2xl bg-gradient-to-r from-green-500/[0.06] to-emerald-500/[0.03] border border-green-500/10 p-4">
                <p className="text-[10px] font-bold text-green-500/60 uppercase tracking-wider mb-1">Platform Impact</p>
                <p className="text-lg font-bold text-green-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>30-second reports</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Average time from photo to submission</p>
              </div>
            </div>
          </div>

          {/* Right panel: The Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-full flex items-start lg:items-center justify-center p-4 lg:p-8">
              <div className="w-full max-w-lg">
                {/* Mobile-only compact banner */}
                <div className="lg:hidden mb-4 rounded-2xl bg-gradient-to-r from-blue-600/15 to-cyan-600/8 border border-blue-500/15 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Camera size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Anonymous Reporting</p>
                      <p className="text-[11px] text-slate-400">Snap, pin, describe — done in 30 seconds</p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-3xl p-5 lg:p-7 shadow-2xl shadow-black/30 border border-white/[0.06]">
                  <ReportForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
