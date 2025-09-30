'use client'
import TextFormInput from '@/components/form/TextFormInput'
import Link from 'next/link'
import logoDark from '@/assets/images/logo.png'
import logoLight from '@/assets/images/logo.png'
import { Button, FormCheck } from 'react-bootstrap'
import useSignIn from './useSignIn'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import Image from 'next/image'

const LoginFrom = () => {
  const { loading, login, control } = useSignIn()
  return (
    <form className="authentication-form p-4 shadow rounded bg-white" onSubmit={login}>
      <div className="auth-logo mb-4">
        <Link href="/dashboard" className="logo-dark">
          <Image src={logoDark} height={44} alt="logo dark" />
        </Link>
        <Link href="/dashboard" className="logo-light">
          <Image src={logoLight} height={44} alt="logo light" />
        </Link>
      </div>
      <h2 className="fw-bold fs-24">Sign In</h2>
      <p className="text-muted mt-1 mb-4">Enter your email address and password to access admin panel.</p>
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Enter your email" />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <>
            <label className="form-label" htmlFor="example-password">
              Password
            </label>
          </>
        }
      />

      <div className="mb-3">
        <FormCheck label="Remember me" id="sign-in" />
      </div>

      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          Sign In
        </Button>
      </div>
    </form>
  )
}

export default LoginFrom
