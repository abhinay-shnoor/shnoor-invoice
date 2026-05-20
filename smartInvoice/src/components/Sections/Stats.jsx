import { motion } from 'framer-motion'
import { stats } from '../../data'
import { useInView } from '../../hooks/useInView'
import { useCounter } from '../../hooks/useCounter'
import FadeIn from '../ui/FadeIn'

function StatItem({ stat, started }) {
  const count = useCounter(stat.value, 2200, started)

  return (
    <div className="text-center">
      <div className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white mb-2">
        {stat.prefix}
        <span>{count.toLocaleString()}</span>
        {stat.suffix}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
    </div>
  )
}

export default function Stats() {
  const { ref, inView } = useInView()

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-blue-600/5 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">By The Numbers</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            Trusted by businesses{' '}
            <span className="text-gradient-blue">across India</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-slate-200 dark:divide-white/5">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <StatItem stat={stat} started={inView} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}