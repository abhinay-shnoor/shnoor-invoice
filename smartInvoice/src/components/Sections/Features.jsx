import { features } from '../../data'
import SectionLabel from '../ui/SectionLabel'

function FeatureCard({ feature }) {
  const Icon = feature.icon

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 h-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center mb-12">
          <SectionLabel className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            Core Features
          </SectionLabel>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Built for everyday teams.
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Practical features for handling invoicing, approvals, and reporting without extra clutter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
