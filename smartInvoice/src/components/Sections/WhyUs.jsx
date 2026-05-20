import { whyUsPoints } from '../../data'

export default function WhyUs() {
  return (
    <section id="why-us" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-4">
              Why Shnoor Invoice
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Fewer clicks, clearer finances.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-8 mb-8">
              We keep invoicing and expense tracking easy so you can focus on growing your business without confusing menus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyUsPoints.map((point) => {
              const Icon = point.icon
              return (
                <div key={point.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{point.title}</h3>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{point.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}