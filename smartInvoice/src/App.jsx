import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Products from './components/sections/Products'
import Features from './components/sections/Features'
import Workflow from './components/sections/Workflow'
import WhyUs from './components/sections/WhyUs'
import Stats from './components/sections/Stats'
import CTA from './components/sections/CTA'
import AuthModal from './components/Auth/AuthModal'
import Dashboard from './components/Dashboard/Dashboard'

export default function App({ isGoogleConfigured }) {
  const [theme, setTheme] = useState('light')
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [adminEmail, setAdminEmail] = useState('admin@shnoorinvoice.com')

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    setTheme(storedTheme ?? preferredTheme)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (auth) {
      localStorage.setItem('auth_user', JSON.stringify(auth))
    } else {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token')
    }
  }, [auth])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // If user is authenticated, render the dedicated dashboard workspace immediately
  if (auth) {
    return (
      <Dashboard
        user={auth}
        onLogout={() => {
          setAuth(null)
          // Scroll page to top on logout
          window.scrollTo(0, 0)
        }}
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
      />
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar theme={theme} onToggleTheme={toggleTheme} onStart={() => setShowAuthModal(true)} />
      <main>
        <Hero onStart={() => setShowAuthModal(true)} />
        <Products />
        <Features />
        <Workflow />
        <Stats />
        <WhyUs />
        <CTA onStart={() => setShowAuthModal(true)} />
      </main>
      <Footer />

      {/* Auth Modal Sheet */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(profile) => setAuth(profile)}
        isGoogleConfigured={isGoogleConfigured}
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
      />
    </div>
  )
}