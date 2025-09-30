'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import type { ChildrenType } from '@/types/component-props'
import FallbackLoading from '../FallbackLoading'
import { useAppSelector } from '@/hooks'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { push } = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated && !token) {
      push(`/auth/sign-in?redirectTo=${pathname}`)
    }
  }, [isAuthenticated, token, pathname, push])

  if (!isAuthenticated && !token) {
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}

export default AuthProtectionWrapper
