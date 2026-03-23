import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, Star, CheckCircle, Clock, User, ChevronRight, Stethoscope } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const MOCK_THERAPISTS = [
  {
    id: 't001', name: 'Dr. Priya Sharma',
    specializations: ['CBT', 'Anxiety', 'Academic Stress'],
    availability: ['Mon 10:00', 'Mon 14:00', 'Wed 11:00', 'Fri 15:00'],
    bio: '10 years experience in student mental health. PhD in Clinical Psychology, IIT Delhi.',
    rating: 4.9, sessions_completed: 340, color: '#6366f1',
  },
  {
    id: 't002', name: 'Dr. Arjun Mehta',
    specializations: ['DBT', 'Emotional Regulation', 'Depression'],
    availability: ['Tue 09:00', 'Thu 13:00', 'Fri 10:00'],
    bio: 'Specialist in dialectical behavior therapy for college students. Published researcher.',
    rating: 4.8, sessions_completed: 210, color: '#ec4899',
  },
  {
    id: 't003', name: 'Ms. Kavya Nair',
    specializations: ['ACT', 'Mindfulness', 'Study Skills'],
    availability: ['Mon 11:00', 'Wed 14:00', 'Thu 16:00'],
    bio: 'ACT practitioner helping students find clarity and purpose through mindfulness.',
    rating: 4.7, sessions_completed: 180, color: '#10b981',
  },
]

export default function BookingPage() {
  const { user, profile } = useAuth()
  const [therapists, setTherapists]   = useState(MOCK_THERAPISTS)
  const [selected, setSelected]       = useState(null)
  const [slot, setSlot]               = useState('')
  const [concern, setConcern]         = useState('')
  const [preferredTherapy, setPreferredTherapy] = useState('')
  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(false)
  const [confirmed, setConfirmed]     = useState(null)
  const [step, setStep]               = useState(1) // 1: choose therapist, 2: choose slot, 3: confirm

  useEffect(() => {
    axios.get(`${API}/api/booking/therapists`).then(r => setTherapists(r.data.therapists)).catch(() => {})
    if (user) axios.get(`${API}/api/booking/bookings/${user.uid}`).then(r => setBookings(r.data.bookings)).catch(() => {})
  }, [user])

  const handleBook = async () => {
    if (!selected || !slot) { toast.error('Select a therapist and time slot'); return }
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/api/booking/book`, {
        user_id: user?.uid || 'demo-user',
        user_name: user?.displayName || 'Student',
        user_email: user?.email || 'student@email.com',
        therapist_id: selected.id,
        slot,
        concern,
        preferred_therapy: preferredTherapy,
      })
      setConfirmed(data)
      setBookings(prev => [...prev, { ...data, therapist_id: selected.id }])
      toast.success('Session booked! 🎉')
    } catch {
      toast.error('Booking failed — check backend connection')
      setConfirmed({
        booking_id: 'BK-DEMO1234',
        therapist_name: selected.name,
        slot,
        status: 'confirmed',
        confirmation_message: `Your session with ${selected.name} is confirmed for ${slot}.`,
      })
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) return <BookingConfirmed confirmed={confirmed} onReset={() => { setConfirmed(null); setSelected(null); setSlot(''); setStep(1) }} />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Book a Session</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Schedule a confidential session with a college counselor
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {['Choose Therapist', 'Select Slot', 'Confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'text-white shadow-md' : 'text-gray-400'}`}
              style={step === i + 1 ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : step <= i ? { background: 'var(--bg-tertiary)' } : {}}>
              {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: step === i + 1 ? '#6366f1' : 'var(--text-tertiary)' }}>{s}</span>
            {i < 2 && <div className="w-8 h-px" style={{ background: step > i + 1 ? '#10b981' : 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Therapists */}
      {step === 1 && (
        <div className="space-y-3">
          {therapists.map(t => (
            <button key={t.id} onClick={() => { setSelected(t); setStep(2) }}
              className={`apple-card p-5 w-full text-left flex items-start gap-4 transition-all ${selected?.id === t.id ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${t.color}18` }}>
                <Stethoscope size={22} style={{ color: t.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{t.rating}</span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>({t.sessions_completed} sessions)</span>
                  </div>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{t.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.specializations.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${t.color}18`, color: t.color }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} className="mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Slot & Details */}
      {step === 2 && selected && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm flex items-center gap-1" style={{ color: '#6366f1' }}>
            ← Back
          </button>
          <div className="apple-card p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Available Slots — {selected.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {selected.availability.map(s => (
                <button key={s} onClick={() => setSlot(s)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${slot === s ? 'text-white shadow-md' : ''}`}
                  style={slot === s
                    ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }
                    : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <Clock size={14} />
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="label-text block">What's your main concern? (optional)</label>
                <textarea value={concern} onChange={e => setConcern(e.target.value)}
                  placeholder="Briefly describe what you'd like to discuss…"
                  rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="label-text block">Preferred Therapy Approach</label>
                <select value={preferredTherapy} onChange={e => setPreferredTherapy(e.target.value)} className="input-field">
                  <option value="">No preference — let the therapist decide</option>
                  <option value="CBT">CBT — Cognitive Behavioral Therapy</option>
                  <option value="DBT">DBT — Dialectical Behavior Therapy</option>
                  <option value="ACT">ACT — Acceptance & Commitment</option>
                  <option value="SFBT">SFBT — Solution-Focused Brief Therapy</option>
                  <option value="MI">MI — Motivational Interviewing</option>
                </select>
              </div>
            </div>

            <button onClick={() => setStep(3)} disabled={!slot}
              className="btn-primary mt-5 disabled:opacity-40">
              Review Booking <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selected && (
        <div className="space-y-4">
          <button onClick={() => setStep(2)} className="text-sm flex items-center gap-1" style={{ color: '#6366f1' }}>
            ← Back
          </button>
          <div className="apple-card p-6">
            <h3 className="font-semibold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>Confirm Your Booking</h3>

            {[
              ['Therapist', selected.name],
              ['Date & Time', slot],
              ['Your Name', user?.displayName || 'Student'],
              ['Email', user?.email || '—'],
              ['Concern', concern || 'Not specified'],
              ['Preferred Therapy', preferredTherapy || 'Therapist\'s discretion'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}

            <div className="mt-5 p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                📧 A confirmation will be sent to <strong>{user?.email}</strong>. Your session is confidential.
              </p>
            </div>

            <button onClick={handleBook} disabled={loading} className="btn-primary w-full mt-4">
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><CheckCircle size={16} /> Confirm Booking</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Past bookings */}
      {bookings.length > 0 && step === 1 && (
        <div className="apple-card p-5">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Sessions</h3>
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b.booking_id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{b.therapist_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{b.slot} · {b.booking_id}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingConfirmed({ confirmed, onReset }) {
  return (
    <div className="max-w-md mx-auto pt-20 page-enter">
      <div className="apple-card p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Session Confirmed!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {confirmed.confirmation_message}
        </p>
        <div className="space-y-2 text-left mb-6">
          {[
            ['Booking ID', confirmed.booking_id],
            ['Therapist', confirmed.therapist_name],
            ['Slot', confirmed.slot],
            ['Status', confirmed.status],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onReset} className="btn-primary w-full">Book Another Session</button>
      </div>
    </div>
  )
}
