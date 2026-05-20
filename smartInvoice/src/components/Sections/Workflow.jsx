import { motion } from 'framer-motion'
import { workflowSteps } from '../../data'
import FadeIn from '../ui/FadeIn'
import SectionLabel from '../ui/SectionLabel'

function WorkflowStep({ step, index, total }) {
  const Icon = step.icon
  const isLast = index === total - 1

  return (
    <FadeIn delay={index * 0.06}>
      <div className="relative flex flex-col items-center text-center group">
        {/* Connector line */}
        {!isLast && (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="hidden lg:block absolute top-7 left-1/2 w-full h-px bg-gradient-to-r from-blue-500/40 to-transparent origin-left"
            style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 1rem)' }}
          />
        )}

        {/* Icon circle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative z-10 w-14 h-14 rounded-2xl glass border border-white/10 group-hover:border-blue-500/30 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-500/5"
        >
          <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink-800 border border-ink-600 flex items-center justify-center text-xs font-mono text-ink-400">
            {step.step}
          </span>
        </motion.div>

        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">{step.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">{step.description}</p>
      </div>
    </FadeIn>
  )
}

export default function Workflow() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <SectionLabel className="bg-emerald-500/8 text-emerald-500 border-emerald-500/20 mb-4">
            How It Works
          </SectionLabel>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white mt-4 mb-4">
            From invoice to{' '}
            <span className="text-gradient">insight</span>{' '}
            in minutes
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            An end-to-end workflow that eliminates spreadsheets, reduces errors, and surfaces intelligence automatically.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-4">
          {workflowSteps.map((step, i) => (
            <WorkflowStep key={step.step} step={step} index={i} total={workflowSteps.length} />
          ))}
        </div>

        {/* Bottom note */}
        <FadeIn className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Average setup time:{' '}
            <span className="text-slate-900 dark:text-white font-semibold">under 30 minutes.</span>{' '}
            No implementation consultant needed.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}