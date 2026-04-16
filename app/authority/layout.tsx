'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, List, ArrowLeft, Shield } from 'lucide-react';

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex flex-col bg-[var(--civic-bg)] overflow-hidden">
      {/* Top nav */}
      <header className="shrink-0 flex items-center gap-4 px-4 py-3 border-b border-white/6 bg-[var(--civic-surface)]">
        <Link href="/" className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={14} className="text-slate-400" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Shield size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 leading-none">Authority Portal</p>
            <p className="text-sm font-bold text-white leading-none mt-0.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              CivicPulse
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="ml-auto flex gap-1 p-1 rounded-xl bg-white/4 border border-white/6">
          <Link href="/authority" className={`nav-tab text-xs py-1.5 px-3 ${pathname === '/authority' ? 'active' : ''}`}>
            <MapPin size={13} />
            Map View
          </Link>
          <Link href="/authority/list" className={`nav-tab text-xs py-1.5 px-3 ${pathname === '/authority/list' ? 'active' : ''}`}>
            <List size={13} />
            List View
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
