'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { useLoginMutation } from '@/store/apiSlice'
import { useAppDispatch } from '@/hooks'
import { setCredentials } from '@/store/authSlice'
import { authService } from '@/services/authService'

const useSignIn = () => {
  const [loginUser, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      const result = await loginUser(values).unwrap()
      
      // Store credentials in Redux state and localStorage
      dispatch(setCredentials({
        token: result.token,
        user: result.data
      }))
      authService.setToken(result.token)
      
      // On success, redirect to dashboard
      push(queryParams['redirectTo'] ?? '/dashboard')
      showNotification({ 
        message: result.message || 'Successfully logged in. Redirecting....', 
        variant: 'success' 
      })
    } catch (error: any) {
      // On failure, show error toast message
      showNotification({ 
        message: error?.data?.message || 'Login failed. Please try again.', 
        variant: 'danger' 
      })
    }
  })

  return { loading: isLoading, login, control }
}

export default useSignIn
