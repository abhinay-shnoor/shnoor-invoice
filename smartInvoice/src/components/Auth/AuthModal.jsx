import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, Lock, Shield } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

export default function AuthModal({ isOpen, onClose, onLogin, isGoogleConfigured, adminEmail, setAdminEmail }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fullstack backend api authentication helper
  const handleAuthSuccess = async (email, password, name, isSignUpMode = false, isGoogleAuth = false) => {
    setIsLoading(true)
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
    try {
      let response;
      if (isGoogleAuth) {
        // Try logging in first
        response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        
        if (!response.ok) {
          // If login fails, try to register
          response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
          })
          
          if (response.ok) {
            // Login again to obtain access token
            response = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            })
          }
        }
      } else if (isSignUpMode) {
        response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password }),
        })
        
        if (response.ok) {
          // Auto login after sign up
          response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
        }
      } else {
        response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      }

      if (response.ok) {
        const data = await response.json()
        const user = data.user || data // Adjust based on backend response
        if (data.access_token) {
          localStorage.setItem('token', data.access_token)
        }
        
        onLogin({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
          role: user.role,
          attemptedAdmin: user.role === 'admin',
          isGoogle: isGoogleAuth,
        })
        onClose()
      } else {
        const errData = await response.json()
        alert(errData.detail || errData.error || "Server authentication failed.")
      }
    } catch (err) {
      console.error("Auth server error:", err)
      alert("Unable to connect to the backend authentication server. Please ensure the FastAPI server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  // Web API endpoint to retrieve user profile after Google Login
  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
      )
      if (response.ok) {
        const data = await response.json()
        await handleAuthSuccess(data.email, 'googleoauth', data.name, false, true)
      } else {
        alert("Failed to fetch Google profile.")
      }
    } catch (error) {
      console.error("Google Auth Error:", error)
      alert("An error occurred during Google Authentication.")
    } finally {
      setIsLoading(false)
    }
  }

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      alert("Google login failed.")
    },
  })

  const handleGoogleClick = () => {
    if (!isLoading) {
      if (isGoogleConfigured) {
        googleLogin()
      } else {
        // Fallback for seamless local testing
        handleAuthSuccess(adminEmail, 'admin123', 'Sang SuperAdmin', false, true)
      }
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!emailInput || !passwordInput || (isSignUp && !nameInput)) return
    
    const cleanName = isSignUp 
      ? nameInput 
      : emailInput.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
      
    handleAuthSuccess(emailInput, passwordInput, cleanName, isSignUp, false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        {/* Modal body */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950/95"
        >
          {/* Header decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-350 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-3 border border-indigo-150/10">
              <Shield className="w-3.5 h-3.5" /> Shnoor Invoice
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {isSignUp 
                ? 'Enter your details below to set up your Shnoor profile.' 
                : 'Sign in to access your invoice management dashboard.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Sang SuperAdmin"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition shadow shadow-indigo-500/10"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle login / signup */}
          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmailInput('')
                setNameInput('')
                setPasswordInput('')
              }}
              className="font-bold text-indigo-600 hover:underline dark:text-indigo-400 transition"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
