'use client'

import { createContext, useContext } from 'react'
import { useAppSelector } from '@/hooks'
import { authService } from '@/services/authService'

type AuthContextType = {
  isAuthenticated: boolean
  token: string | null
  user: any | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAppSelector((state) => state.auth)
  
  // Check if user is authenticated via Redux state or localStorage
  const isAuthenticated = authState.isAuthenticated || authService.isAuthenticated()
  const token = authState.token || authService.getToken()
  const user = authState.user

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
