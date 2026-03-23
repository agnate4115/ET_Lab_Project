import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignUpCompletePage() {
  const { user, profile, updateMobile } = useAuth()
  const [mobile, setMobile] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const digits = mobile.replace(/\D/g, '')
    if (digits.length < 10) { toast.error('Enter a valid phone number'); return }

    setLoading(true)
    try {
      await updateMobile(`${countryCode}${digits}`)
      toast.success('Profile complete! Welcome to MindBridge 🎉')
      navigate('/')
    } catch {
      toast.error('Failed to save. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-enter"
      style={{ background: 'var(--bg-secondary)' }}>
      <div className="glass-card w-full max-w-md p-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500">
            <CheckCircle size={14} className="text-white" />
          </div>
          <div className="flex-1 h-1 rounded-full bg-indigo-500" />
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500">
            <span className="text-white text-xs font-bold">2</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            One more step
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Hi {user?.displayName?.split(' ')[0] || 'there'}! Add your mobile number for appointment reminders and emergency contact.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text block">Mobile Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="input-field w-28 flex-shrink-0"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+65">🇸🇬 +65</option>
              </select>
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="input-field pl-9"
                  maxLength={12}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              📱 Used for appointment reminders, VAPI intake call scheduling, and emergency wellness check-ins.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>Complete Setup <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <button onClick={() => navigate('/')} className="w-full text-center text-sm mt-4"
          style={{ color: 'var(--text-tertiary)' }}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
