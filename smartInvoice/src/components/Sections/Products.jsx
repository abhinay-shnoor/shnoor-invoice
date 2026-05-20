import { ArrowRight } from 'lucide-react'
import { products } from '../../data'
import SectionLabel from '../ui/SectionLabel'

function ProductCard({ product }) {
  const Icon = product.icon

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{product.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{product.tagline}</p>
        </div>
      </div>

      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>

      <ul className="mt-6 space-y-3">
        {product.features.map(({ icon: FIcon, text }) => (
          <li key={text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <a
        href={product.href}
        target={product.href?.startsWith('http') ? '_blank' : undefined}
        rel={product.href?.startsWith('http') ? 'noreferrer' : undefined}
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-white"
      >
        {product.cta} <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  )
}

export default function Products() {
  return (
    <section id="products" className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center mb-12">
          <SectionLabel className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            Our Platform
          </SectionLabel>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Our Products
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Three integrated product suites for invoice management, HRMS, and workspace coordination.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
