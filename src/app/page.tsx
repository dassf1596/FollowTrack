import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Activity, ShieldCheck, RefreshCw, Search, Download, HelpCircle, ArrowRight, Check } from 'lucide-react'
import { LandingFaq } from '@/components/LandingFaq'

export const runtime = 'edge'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#05070f] text-gray-200 font-sans antialiased selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 bg-indigo-500/5 blur-[150px] rounded-full" />
      <div className="absolute top-[800px] right-0 -z-10 h-[400px] w-[600px] bg-violet-600/5 blur-[120px] rounded-full" />

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#05070f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Follow<span className="text-indigo-400">Track</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15 border border-white/5 transition-colors cursor-pointer"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-sm animate-pulse">
          <ShieldCheck className="h-3.5 w-3.5" />
          100% Privacy Safeguarded. No Data Scraping.
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Manage, Compare, and Analyze Your{' '}
          <span className="text-gradient-purple">Follower Lists</span> Safely
        </h1>
        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl font-sans leading-relaxed">
          Store secure snapshot backups of your follower lists, track growth milestones, compare snapshots over time, and analyze accounts manually—without compromising platform terms.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] cursor-pointer"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4.5 w-4.5" />
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Explore Features
          </a>
        </div>

        {/* Visual mock card */}
        <div className="mt-20 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/40 p-2 shadow-2xl backdrop-blur-md relative group">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-6 sm:p-8 flex flex-col md:flex-row gap-6 text-left">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Comparison Tool</span>
              </div>
              <h3 className="text-xl font-bold text-white">Snapshot Comparison</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                Instantly see which accounts were added or removed between snapshots. Export lists to JSON/CSV for safe keeping and tracking.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 text-center flex-1">
                  <div className="text-xl font-bold text-emerald-400">+14</div>
                  <div className="text-2xs text-gray-400 uppercase font-sans">Added</div>
                </div>
                <div className="bg-rose-950/30 border border-rose-500/20 rounded-lg p-3 text-center flex-1">
                  <div className="text-xl font-bold text-rose-400">-5</div>
                  <div className="text-2xs text-gray-400 uppercase font-sans">Removed</div>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col gap-2 font-mono text-xs text-gray-300 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-2xs text-gray-400 font-sans uppercase">
                <span>Username</span>
                <span>Status</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 rounded px-2.5 py-1.5 text-emerald-300">
                <span>@alex_k</span>
                <span className="font-semibold text-2xs uppercase">Added</span>
              </div>
              <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 rounded px-2.5 py-1.5 text-rose-300">
                <span>@jane.doe</span>
                <span className="font-semibold text-2xs uppercase">Removed</span>
              </div>
              <div className="flex justify-between items-center opacity-85 px-2.5 py-1.5">
                <span>@emma_s</span>
                <span className="text-gray-400 text-2xs">Unchanged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/5 bg-[#070914]/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Everything you need to track snapshots</h2>
            <p className="mt-4 text-gray-400 text-sm font-sans leading-relaxed">
              We provide professional list snapshotting tools that prioritize safety, privacy, and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Snapshot Tracking</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans flex-1">
                Upload files or paste usernames manually. Your lists are securely stored under robust RLS protocols.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Comparison Reports</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans flex-1">
                Compare any two historical snapshots to immediately identify followers added or lost.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 mb-4 group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Search History</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans flex-1">
                Query usernames to instantly map which snapshots they appeared in, first seen dates, and last seen dates.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 mb-4 group-hover:scale-110 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">CSV / JSON Export</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-sans flex-1">
                Export snapshots and list comparisons at any time to keep a local copy of your analytical research data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              A private, secure workspace built for modern tracking
            </h2>
            <p className="text-gray-400 font-sans leading-relaxed">
              Third-party APIs and scraping protocols can result in accounts being suspended or locked. FollowTrack keeps your process safe by depending strictly on manual uploads you control.
            </p>
            <ul className="space-y-3 font-sans text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Check className="h-3 w-3" />
                </div>
                Zero integrations required — paste or drag-and-drop lists
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Check className="h-3 w-3" />
                </div>
                Isolated databases secure with Supabase Row-Level Security
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Check className="h-3 w-3" />
                </div>
                Detailed history log tracks all snapshots, exports, and edits
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Check className="h-3 w-3" />
                </div>
                Lightning-fast Edge network rendering
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-2">
              <div className="text-2xl font-bold text-indigo-400">100%</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">No Account Link Required</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-2">
              <div className="text-2xl font-bold text-violet-400">Zero</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Automated Scraping Suspensions</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-2">
              <div className="text-2xl font-bold text-sky-400">JSON/CSV</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Flexible Exports</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-2">
              <div className="text-2xl font-bold text-emerald-400">Isolated</div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Supabase SQL Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-white/5 bg-[#070914]/40 relative">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-400 mt-2 font-sans">
              Learn how FollowTrack operates securely and efficiently.
            </p>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#05070f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Follow<span className="text-indigo-400">Track</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 font-sans">
            &copy; {new Date().getFullYear()} FollowTrack. Built securely. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 font-sans">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
