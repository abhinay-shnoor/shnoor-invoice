import { ArrowRight } from 'lucide-react'

export default function Hero({ onStart }) {
  return (
    <section id="home" className="relative pt-24 pb-16 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-4">
              Smart invoice management
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Simple finance tools for early teams.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Create invoices, track payments, manage expenses, and handle GST in one easy dashboard without extra clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cta"
                onClick={(e) => {
                  if (onStart) {
                    e.preventDefault()
                    onStart()
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-500/10 rounded-xl px-6 py-3 text-sm"
              >
                Start free
              </a>
              <a
                href="#features"
                className="border border-slate-300 dark:border-slate-700 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition rounded-xl"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">Platform Metrics</h3>
            
            <div className="space-y-4">
              {/* Total Volume sent */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Invoices Sent</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">1,240+</p>
                </div>
                <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 text-xs font-semibold text-indigo-650 dark:text-indigo-400">
                  Global Volume
                </span>
              </div>

              {/* Supported Currencies */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Supported Currencies</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">USD, EUR, INR</p>
                </div>
                <span className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 text-xs font-semibold text-amber-650 dark:text-amber-400">
                  Multi-Currency
                </span>
              </div>

              {/* Average processing time */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Processing Time</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">&lt; 2 minutes</p>
                </div>
                <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-semibold text-emerald-650 dark:text-emerald-400">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}