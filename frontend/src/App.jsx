import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import SignInPage from './pages/SignInPage'
import SignUpCompletePage from './pages/SignUpCompletePage'
import DashboardPage from './pages/DashboardPage'
import TherapyPage from './pages/TherapyPage'
import BookingPage from './pages/BookingPage'
import VapiCallPage from './pages/VapiCallPage'
import Layout from './components/dashboard/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🧠</span>
        </div>
        <div className="flex gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup/complete" element={<SignUpCompletePage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="therapy" element={<TherapyPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="vapi-call" element={<VapiCallPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
