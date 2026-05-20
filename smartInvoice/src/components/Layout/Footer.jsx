import { Zap, Github, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  Products: [
    { label: 'Invoice & Expense', href: '#products' },
    { label: 'HRMS Platform', href: '#products' },
    { label: 'Workspace Management', href: '#products' },
    { label: 'Pricing', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#why-us' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center dark:bg-slate-100 dark:text-ink-900">
                <Zap className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-lg font-semibold">Shnoor Invoice</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Simple finance tools for small teams.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@shnoorinvoice.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>UAE and WorldWide</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900 dark:text-slate-200 mb-3">{section}</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Shnoor Invoice. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[
              { icon: Github, href: '#', label: 'GitHub' },
              { icon: Linkedin, href: '#', label: 'LinkedIn' },
              { icon: Twitter, href: '#', label: 'Twitter' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-white transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}