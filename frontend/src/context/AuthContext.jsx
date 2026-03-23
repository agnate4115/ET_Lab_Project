import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../utils/firebase'
import axios from 'axios'

const AuthContext = createContext()
const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Try to load full profile from backend
        try {
          const { data } = await axios.get(`${API}/api/auth/profile/${firebaseUser.uid}`)
          setProfile(data)
        } catch {
          setProfile({ uid: firebaseUser.uid, email: firebaseUser.email, display_name: firebaseUser.displayName })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = () => signOut(auth)

  const updateMobile = async (mobile) => {
    if (!user) return
    await axios.put(`${API}/api/auth/profile/mobile`, { uid: user.uid, mobile_number: mobile })
    setProfile(p => ({ ...p, mobile_number: mobile }))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, updateMobile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
