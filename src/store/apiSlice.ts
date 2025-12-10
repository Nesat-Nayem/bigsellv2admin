import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Login request payload
export interface LoginRequest {
  email: string
  password: string
}

// User object in response
export interface UserData {
  _id: string
  name: string
  phone: string
  email: string
  role: string
  status: string
  packageFeatures: any[]
  menuBookmarks: any[]
  createdAt: string
  updatedAt: string
  __v: number
}

// Login response
export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  token: string
  data: UserData
}

// Forgot/Reset password via email
export interface RequestResetEmailRequest { email: string }
export interface BasicResponse { success: boolean; statusCode: number; message?: string }
export interface ConfirmResetEmailRequest { email: string; otp: string; newPassword: string }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState)?.auth?.token
      console.log(token)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/signin',
        method: 'POST',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    requestResetPasswordEmail: builder.mutation<BasicResponse, RequestResetEmailRequest>({
      query: (payload) => ({
        url: 'auth/forgot-password-email',
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    confirmResetPasswordEmail: builder.mutation<BasicResponse, ConfirmResetEmailRequest>({
      query: (payload) => ({
        url: 'auth/reset-password-email',
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
  }),
})

export const { useLoginMutation, useRequestResetPasswordEmailMutation, useConfirmResetPasswordEmailMutation } = apiSlice
