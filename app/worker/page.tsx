'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWorkerTasks } from '@/lib/queries';

const FloatingLines = dynamic(() => import('@/components/FloatingLines'), { ssr: false });
import WorkerTaskCard from '@/components/WorkerTaskCard';
import { ArrowLeft, HardHat, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

export default function WorkerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingAuth(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'In-Progress' | 'Treated'>('All');
  const { data: globalTasks, isLoading, error } = useWorkerTasks(user?.id);

  const tasks = globalTasks?.filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'In-Progress') return t.status === 'In-Progress' && !t.fix_image_url;
    if (filter === 'Treated') return t.status === 'In-Progress' && !!t.fix_image_url;
    return true;
  });

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[var(--civic-bg)] flex items-center justify-center">
        <Loader2 size={32} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-[var(--civic-bg)] flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* FloatingLines Background */}
        <div className="fixed inset-0 z-0">
          <FloatingLines
            linesGradient={['#00ff15ff', '#2cc70dff', '#00ab06ff', '#38e509ff']}
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[4, 6, 3]}
            animationSpeed={0.8}
            interactive={true}
            parallax={true}
            parallaxStrength={0.15}
          />
        </div>

        {/* Readability overlay */}
        <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[var(--civic-bg)]/60 via-[var(--civic-bg)]/20 to-[var(--civic-bg)]/70 pointer-events-none" />

        <div className="relative z-10 glass-frost max-w-sm w-full p-8 text-center rounded-3xl shadow-2xl shadow-black/50 border border-white/10 slide-up">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-6">
            <HardHat size={32} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Worker Access
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            You must be logged in to view your assigned tasks.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
              const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) alert(error.message);
            }}
            className="flex flex-col gap-3 text-left"
          >
            <input type="email" name="email" placeholder="Worker Email" required className="civic-input" />
            <input type="password" name="password" placeholder="Password" required className="civic-input" />
            <button type="submit" className="btn-primary w-full mt-2">
              Login to Portal
            </button>
          </form>
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-slate-400 mb-2">Need a worker account?</p>
            <button
              type="button"
              onClick={async () => {
                const email = prompt('Enter email to sign up as a new worker:');
                const password = prompt('Enter a password (min 6 chars):');
                if (email && password) {
                  const { error } = await supabase.auth.signUp({ email, password });
                  if (error) alert(error.message);
                  else alert('Registration successful! You may now log in.');
                }
              }}
              className="btn-secondary w-full text-xs py-2"
            >
              Register New Worker
            </button>
          </div>
          <Link href="/" className="inline-block mt-4 text-sm text-slate-500 hover:text-white transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--civic-bg)] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/6 bg-[var(--civic-surface)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={14} className="text-slate-400" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <HardHat size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                My Tasks
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main Feed */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-grid">
        <div className="max-w-5xl mx-auto pb-12">

          {/* Status Filters */}
          <div className="flex gap-2 p-1.5 glass rounded-xl mb-6 w-full max-w-fit mx-auto sm:mx-0 overflow-x-auto scroller-hidden">
            {['All', 'Pending', 'In-Progress', 'Treated'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {f === 'Treated' ? 'Marked as Done' : f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={24} className="text-amber-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading your tasks…</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm glass">
              Failed to load tasks.
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <WorkerTaskCard key={task.id} report={task} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-24 glass">
              <RefreshCw size={32} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No active tasks</h3>
              <p className="text-sm text-slate-400 max-w-xs">
                You&apos;re all caught up! Enjoy your break. New assignments will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
