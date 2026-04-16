import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Camera, ShieldCheck, HardHat, ArrowRight, Radio, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CivicPulse — Report. Track. Resolve.',
  description: 'The fastest way to report and resolve public infrastructure issues in your city.',
};

const ROLES = [
  {
    href: '/citizen',
    icon: Camera,
    label: 'Report an Issue',
    sublabel: 'Citizen Portal',
    desc: 'Spotted a pothole, broken streetlight, or flooding? Report it in 30 seconds — no account needed.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20 hover:border-blue-500/50',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    badge: 'Anonymous · No Login',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    href: '/authority',
    icon: MapPin,
    label: 'Overview Dashboard',
    sublabel: 'Authority Portal',
    desc: 'Full-screen incident map with heatmap visualization and operational oversight of all active reports.',
    gradient: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/20 hover:border-violet-500/50',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    badge: 'Live Map · Heatmap',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    href: '/worker',
    icon: HardHat,
    label: 'My Tasks',
    sublabel: 'Field Worker',
    desc: 'View assigned infrastructure issues, upload fix photos, and close tasks on the go.',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20 hover:border-amber-500/50',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    badge: 'Login Required',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    href: '/admin',
    icon: ShieldCheck,
    label: 'Review & Approve',
    sublabel: 'Admin Panel',
    desc: 'Review worker\'s before/after photos, approve closed tickets, or reassign with feedback.',
    gradient: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    badge: 'Admin Only',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

const STATS = [
  { label: 'Avg. Response Time', value: '< 48h', icon: Zap },
  { label: 'Issues Resolved', value: '12,400+', icon: ShieldCheck },
  { label: 'Cities Active', value: '38', icon: Radio },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-grid overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16 slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Radio size={12} className="animate-pulse" />
            Live Infrastructure Monitoring
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Civic<span className="gradient-text">Pulse</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Report infrastructure issues, track resolutions, and keep your city running — all in one platform.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-14 max-w-lg mx-auto slide-up" style={{ animationDelay: '0.1s' }}>
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <Icon size={18} className="text-blue-400 mx-auto mb-2 block" />
              <div className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 slide-up" style={{ animationDelay: '0.15s' }}>
          {ROLES.map(({ href, icon: Icon, label, sublabel, desc, gradient, border, iconBg, iconColor, badge, badgeBg }) => (
            <Link key={href} href={href} className="group block">
              <div className={`rounded-2xl border bg-gradient-to-br ${gradient} ${border} p-6 h-full flex flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1`}>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={22} className={iconColor} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeBg}`}>
                    {badge}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{sublabel}</p>
                  <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {label}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>

                <div className="flex items-center gap-1 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                  Enter portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-xs text-slate-600">
          Built for the Infrastructure Hackathon · Powered by Supabase &amp; Next.js
        </div>
      </div>
    </div>
  );
}
