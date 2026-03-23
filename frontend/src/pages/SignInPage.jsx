import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const token = await user.getIdToken()

      // Verify with backend
      const { data } = await axios.post(`${API}/api/auth/verify`, {
        uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        id_token: token,
      })

      // If no mobile number yet → go to complete profile
      if (!data.user?.mobile_number) {
        navigate('/signup/complete')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error(err)
      toast.error('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden page-enter"
      style={{ background: isDark
        ? 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 60%), #000'
        : 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 60%), #f5f5f7'
      }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(60px)' }} />
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} className="absolute top-6 right-6 p-2.5 rounded-xl btn-secondary">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Card */}
      <div className="glass-card w-full max-w-md p-10 relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome to MindBridge</h1>
          <p className="text-sm mt-1.5 text-center" style={{ color: 'var(--text-secondary)' }}>
            AI-powered mental health support for students
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            { icon: '💬', text: 'Personalized therapy with CBT, DBT, ACT & more' },
            { icon: '🎙️', text: 'Voice-first AI conversations' },
            { icon: '📅', text: 'Book sessions with college counselors' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
