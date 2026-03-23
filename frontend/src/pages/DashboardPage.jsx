import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, Heart, Leaf, Lightbulb, Compass, TrendingUp,
  TrendingDown, Minus, Activity, Moon, Monitor, Zap,
  ArrowRight, BarChart2, BookOpen
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
         LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const THERAPY_META = {
  CBT:  { icon: Brain,     color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  label: 'Cognitive Behavioral Therapy' },
  DBT:  { icon: Heart,     color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  label: 'Dialectical Behavior Therapy' },
  ACT:  { icon: Leaf,      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Acceptance & Commitment' },
  SFBT: { icon: Lightbulb, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Solution-Focused Brief' },
  MI:   { icon: Compass,   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Motivational Interviewing' },
}

const TREND_DATA = [
  { week: 'W1', mood: 4, sleep: 6.5, stress: 7 },
  { week: 'W2', mood: 5, sleep: 7,   stress: 6 },
  { week: 'W3', mood: 4, sleep: 6,   stress: 8 },
  { week: 'W4', mood: 6, sleep: 7.5, stress: 5 },
  { week: 'W5', mood: 7, sleep: 7,   stress: 4 },
  { week: 'W6', mood: 7, sleep: 8,   stress: 3 },
]

const RADAR_DATA = [
  { subject: 'Sleep', A: 70 },
  { subject: 'Activity', A: 55 },
  { subject: 'Focus', A: 65 },
  { subject: 'Social', A: 80 },
  { subject: 'Mood', A: 72 },
  { subject: 'Resilience', A: 60 },
]

const PERF_ICON = { Improved: TrendingUp, Declined: TrendingDown, Same: Minus }
const PERF_COLOR = { Improved: '#10b981', Declined: '#ef4444', Same: '#f59e0b' }

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [studentProfile, setStudentProfile] = useState({
    age: '', gender: '', education_level: '',
    screen_time: '', sleep_hours: '', physical_activity: '',
    stress_level: '', exam_anxiety: '',
  })
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleProfileChange = (field, val) =>
    setStudentProfile(p => ({ ...p, [field]: val }))

  const analyzeProfile = async () => {
    const filled = Object.values(studentProfile).filter(Boolean)
    if (filled.length < 4) { toast.error('Fill in at least 4 fields for analysis'); return }
    setAnalyzing(true)
    try {
      const { data } = await axios.post(`${API}/api/therapy/analyze-profile`, studentProfile)
      setAnalysis(data)
      toast.success('Profile analyzed!')
    } catch {
      toast.error('Analysis failed — check backend connection')
      // Demo fallback
      setAnalysis({
        recommended_therapy: 'CBT',
        risk_level: 'moderate',
        key_concerns: ['Exam anxiety', 'High stress level', 'Disrupted sleep'],
        strengths: ['Regular physical activity', 'Self-awareness'],
        summary: 'Student shows moderate stress levels with exam-related anxiety impacting academic performance. CBT techniques may help restructure negative thought patterns.',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const firstName = user?.displayName?.split(' ')[0] || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your mental wellness summary for today
          </p>
        </div>
        <button onClick={() => navigate('/therapy')} className="btn-primary">
          Start Session <ArrowRight size={16} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sessions This Week',    value: '3',     icon: Brain,    color: '#6366f1', trend: '+1' },
          { label: 'Avg. Sleep',            value: '7.2h',  icon: Moon,     color: '#3b82f6', trend: '+0.4' },
          { label: 'Daily Screen Time',     value: '6.5h',  icon: Monitor,  color: '#f59e0b', trend: '-0.5' },
          { label: 'Wellness Score',        value: '72%',   icon: Activity, color: '#10b981', trend: '+4%' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="apple-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                  {s.trend}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mood trend */}
        <div className="apple-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Wellness Trends</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Last 6 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
              <Area type="monotone" dataKey="mood"  stroke="#6366f1" fill="url(#moodGrad)" strokeWidth={2} name="Mood" />
              <Area type="monotone" dataKey="sleep" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Sleep" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="apple-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Wellness Radar</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
              <Radar name="You" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profile Assessment */}
      <div className="apple-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <BookOpen size={18} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Student Health Assessment</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Fill your profile to get personalized therapy recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div>
            <label className="label-text block">Age</label>
            <input type="number" min="15" max="26" placeholder="e.g. 20"
              value={studentProfile.age}
              onChange={e => handleProfileChange('age', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label-text block">Gender</label>
            <select value={studentProfile.gender}
              onChange={e => handleProfileChange('gender', e.target.value)}
              className="input-field">
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="label-text block">Education Level</label>
            <select value={studentProfile.education_level}
              onChange={e => handleProfileChange('education_level', e.target.value)}
              className="input-field">
              <option value="">Select</option>
              {['Class 8','Class 9','Class 10','Class 11','Class 12','UG Year 1','UG Year 2','UG Year 3','UG Year 4','PG/MBA','MSc/MTech'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text block">Stress Level</label>
            <select value={studentProfile.stress_level}
              onChange={e => handleProfileChange('stress_level', e.target.value)}
              className="input-field">
              <option value="">Select</option>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label className="label-text block">Screen Time (hrs/day)</label>
            <input type="number" step="0.5" min="2" max="12" placeholder="e.g. 6"
              value={studentProfile.screen_time}
              onChange={e => handleProfileChange('screen_time', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label-text block">Sleep (hrs/night)</label>
            <input type="number" step="0.5" min="4" max="9" placeholder="e.g. 7"
              value={studentProfile.sleep_hours}
              onChange={e => handleProfileChange('sleep_hours', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label-text block">Physical Activity (hrs/week)</label>
            <input type="number" step="0.5" min="0" max="10" placeholder="e.g. 3"
              value={studentProfile.physical_activity}
              onChange={e => handleProfileChange('physical_activity', e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="label-text block">Anxious Before Exams</label>
            <select value={studentProfile.exam_anxiety}
              onChange={e => handleProfileChange('exam_anxiety', e.target.value)}
              className="input-field">
              <option value="">Select</option>
              <option>Yes</option><option>No</option>
            </select>
          </div>
        </div>

        <button onClick={analyzeProfile} disabled={analyzing} className="btn-primary">
          {analyzing
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
            : <><Zap size={16} /> Analyze My Profile</>
          }
        </button>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="apple-card p-6 animate-slide-up">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            🎯 Your Personalized Recommendation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recommended therapy */}
            {(() => {
              const t = THERAPY_META[analysis.recommended_therapy] || THERAPY_META.CBT
              const Icon = t.icon
              return (
                <div className="p-4 rounded-xl" style={{ background: t.bg, border: `1px solid ${t.color}30` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} style={{ color: t.color }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: t.color }}>Recommended</span>
                  </div>
                  <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{analysis.recommended_therapy}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t.label}</p>
                  <button onClick={() => navigate('/therapy')} className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: t.color }}>
                    Start Session <ArrowRight size={12} />
                  </button>
                </div>
              )
            })()}

            {/* Risk + concerns */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>RISK LEVEL</p>
              <span className="text-sm font-bold capitalize px-2.5 py-1 rounded-lg"
                style={{
                  color: analysis.risk_level === 'high' ? '#ef4444' : analysis.risk_level === 'moderate' ? '#f59e0b' : '#10b981',
                  background: analysis.risk_level === 'high' ? 'rgba(239,68,68,0.1)' : analysis.risk_level === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                }}>
                {analysis.risk_level}
              </span>
              <p className="text-xs font-semibold mt-3 mb-1" style={{ color: 'var(--text-tertiary)' }}>KEY CONCERNS</p>
              <ul className="space-y-1">
                {(analysis.key_concerns || []).map(c => (
                  <li key={c} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-red-400 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>STRENGTHS</p>
              <ul className="space-y-1 mb-3">
                {(analysis.strengths || []).map(s => (
                  <li key={s} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-green-400 mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{analysis.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Therapy types overview */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Available Therapy Modalities</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(THERAPY_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <button key={key} onClick={() => navigate('/therapy')}
                className="apple-card p-4 text-left group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: meta.bg }}>
                  <Icon size={18} style={{ color: meta.color }} />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{key}</p>
                <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-secondary)' }}>{meta.label}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
