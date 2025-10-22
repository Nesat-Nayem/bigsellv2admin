import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions

export default authSlice.reducer
