'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Camera, ShieldCheck, HardHat, ArrowRight, Radio, Zap } from 'lucide-react';

const Aurora = dynamic(() => import('@/components/Aurora'), { ssr: false });

const ROLES = [
  {
    href: '/citizen',
    icon: Camera,
    label: 'Report an Issue',
    sublabel: 'Citizen Portal',
    desc: 'Spotted a pothole or broken streetlight? Report it anonymously in 30 seconds.',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    badge: 'No Login Needed',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'border-blue-500/15 hover:border-blue-500/40',
  },
  {
    href: '/authority',
    icon: MapPin,
    label: 'Overview Dashboard',
    sublabel: 'Authority Portal',
    desc: 'Live incident map with heatmap visualization and full operational oversight.',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    badge: 'Live Map',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    border: 'border-violet-500/15 hover:border-violet-500/40',
  },
  {
    href: '/worker',
    icon: HardHat,
    label: 'My Tasks',
    sublabel: 'Field Worker',
    desc: 'View assigned issues, upload fix photos, and close tasks on the go.',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    badge: 'Login Required',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'border-amber-500/15 hover:border-amber-500/40',
  },
  {
    href: '/admin',
    icon: ShieldCheck,
    label: 'Review & Approve',
    sublabel: 'Admin Panel',
    desc: 'Approve resolved tickets and manage worker submissions with oversight.',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    badge: 'Admin Only',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    border: 'border-emerald-500/15 hover:border-emerald-500/40',
  },
];

const STATS = [
  { label: 'Avg. Response Time', value: '< 48h', icon: Zap },
  { label: 'Issues Resolved', value: '12,400+', icon: ShieldCheck },
  { label: 'Cities Active', value: '38', icon: Radio },
];

export default function LandingPage() {
  return (
    <div className="relative h-screen overflow-hidden bg-[var(--civic-bg)] flex flex-col">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={['#3b82f6', '#06b6d4', '#a78bfa']}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>

      {/* Readability overlay */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[var(--civic-bg)]/60 via-[var(--civic-bg)]/30 to-[var(--civic-bg)]/70 pointer-events-none" />

      {/* Content — vertically centered, maximized */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12">
        <div className="w-full max-w-6xl">

          {/* Header */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-frost text-blue-400 text-xs font-semibold mb-5 shadow-lg shadow-blue-900/10">
              <Radio size={12} className="animate-pulse" />
              Live Infrastructure Monitoring
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Civic<span className="gradient-text">Pulse</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
              Report infrastructure issues, track resolutions, and keep your city running.
            </p>
          </div>

          {/* Stats — horizontal row */}
          <div className="flex justify-center gap-4 mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass-frost rounded-2xl px-6 py-3 flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
                  <div className="text-[11px] text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Role cards — 4-column grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 slide-up" style={{ animationDelay: '0.15s' }}>
            {ROLES.map(({ href, icon: Icon, label, sublabel, desc, iconBg, iconColor, badge, badgeBg, border }) => (
              <Link key={href} href={href} className="group block">
                <div className={`glass-frost rounded-2xl border ${border} p-5 h-full flex flex-col gap-3 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/40`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                      <Icon size={20} className={iconColor} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
                      {badge}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{sublabel}</p>
                    <h2 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {label}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors pt-2 border-t border-white/5">
                    Enter portal <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-[11px] text-slate-600">
            Built for the Infrastructure Hackathon · Powered by Supabase &amp; Next.js
          </div>
        </div>
      </div>
    </div>
  );
}
