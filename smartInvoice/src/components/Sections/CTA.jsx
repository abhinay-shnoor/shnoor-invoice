import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import FadeIn from '../ui/FadeIn'

export default function CTA({ onStart }) {
  return (
    <section id="cta" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/15 to-blue-600/10" />
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 border border-blue-500/15 rounded-3xl" />

            <div className="relative z-10 px-8 sm:px-16 py-16">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-bold tracking-widest uppercase text-blue-500 dark:text-blue-400 mb-4">Get Started Today</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white mb-5 leading-tight">
                  Build Smarter{' '}
                  <span className="text-gradient">Business Operations</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
                  Join 500+ businesses automating invoices, HR, and workspace operations with Shnoor Invoice. Free 14-day trial. No credit card.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#"
                    onClick={(e) => {
                      if (onStart) {
                        e.preventDefault()
                        onStart()
                      }
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    Start Free <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:hello@shnoorinvoice.com"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    <Mail className="w-4 h-4 text-blue-550 dark:text-blue-400" /> Contact Sales
                  </a>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
                  14 days free · No setup fees · Cancel anytime
                </p>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}