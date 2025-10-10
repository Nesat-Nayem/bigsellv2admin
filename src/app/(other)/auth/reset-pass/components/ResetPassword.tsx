'use client'
import logoDark from '@/assets/images/logo.png'
import logoLight from '@/assets/images/logo.png'
import smallImg from '@/assets/images/small/img-10.jpg'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, FormControl, FormGroup, FormLabel } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useRequestResetPasswordEmailMutation, useConfirmResetPasswordEmailMutation } from '@/store/apiSlice'

const ResetPassword = () => {
  const router = useRouter()
  const { showNotification } = useNotificationContext()

  // Step management
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [emailValue, setEmailValue] = useState('')
  const [otpReadOnly, setOtpReadOnly] = useState(true)

  // Mutations
  const [requestReset, { isLoading: requesting }] = useRequestResetPasswordEmailMutation()
  const [confirmReset, { isLoading: confirming }] = useConfirmResetPasswordEmailMutation()

  // Form 1: Request code (email only)
  const requestSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
  })
  type RequestFormFields = yup.InferType<typeof requestSchema>
  const { control: requestControl, handleSubmit: handleRequestSubmit } = useForm<RequestFormFields>({
    resolver: yupResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const onRequest = handleRequestSubmit(async ({ email }) => {
    try {
      const res: any = await requestReset({ email }).unwrap()
      setEmailValue(email)
      setStep('confirm')
      showNotification({ message: res?.message || 'Reset code sent to email', variant: 'success' })
    } catch (err: any) {
      showNotification({ message: err?.data?.message || 'Failed to send reset code', variant: 'danger' })
    }
  })

  // Form 2: Confirm with OTP + new password
  const confirmSchema = yup.object({
    otp: yup.string().length(4, 'OTP must be 4 digits').required('Please enter the code'),
    newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter a new password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  })
  type ConfirmFormFields = yup.InferType<typeof confirmSchema>
  const { control: confirmControl, handleSubmit: handleConfirmSubmit, reset: resetConfirm, setValue: setConfirmValue } = useForm<ConfirmFormFields>({
    resolver: yupResolver(confirmSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  })

  // Ensure OTP starts blank when switching to confirm step and fight browser autofill
  useEffect(() => {
    if (step === 'confirm') {
      // Reset fields and keep OTP readOnly until focus
      resetConfirm({ otp: '', newPassword: '', confirmPassword: '' })
      setConfirmValue('otp', '')
      setOtpReadOnly(true)
    }
  }, [step, resetConfirm, setConfirmValue])

  const onConfirm = handleConfirmSubmit(async ({ otp, newPassword }) => {
    try {
      const res: any = await confirmReset({ email: emailValue, otp, newPassword }).unwrap()
      showNotification({ message: res?.message || 'Password reset successfully', variant: 'success' })
      setTimeout(() => router.push('/auth/sign-in'), 800)
    } catch (err: any) {
      showNotification({ message: err?.data?.message || 'Failed to reset password', variant: 'danger' })
    }
  })

  return (
    <div className="d-flex flex-column vh-100 p-3">
      <div className="d-flex flex-column flex-grow-1">
        <Row className="h-100">
          <Col xxl={7}>
            <Row className="justify-content-center h-100">
              <Col lg={6} className="py-lg-5">
                <div className="d-flex flex-column h-100 justify-content-center">
                  <div className="auth-logo mb-4">
                    <Link href="/dashboard" className="logo-dark">
                      <Image src={logoDark} height={24} alt="logo dark" />
                    </Link>
                    <Link href="/dashboard" className="logo-light">
                      <Image src={logoLight} height={24} alt="logo light" />
                    </Link>
                  </div>
                  <h2 className="fw-bold fs-24">{step === 'request' ? 'Reset Password' : 'Verify Code & Set New Password'}</h2>
                  {step === 'request' ? (
                    <>
                      <p className="text-muted mt-1 mb-4">Enter your email address and we’ll send you a 4‑digit code to reset your password.</p>
                      <div>
                        <form className="authentication-form" onSubmit={onRequest}>
                          <TextFormInput
                            control={requestControl}
                            name="email"
                            containerClassName="mb-3"
                            label="Email"
                            id="email-id"
                            placeholder="Enter your email"
                          />
                          <div className="mb-1 d-grid">
                            <Button variant="primary" type="submit" disabled={requesting}>
                              {requesting ? 'Sending…' : 'Send Reset Code'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-muted mt-1 mb-4">We sent a 4‑digit code to <strong>{emailValue}</strong>. Enter the code and choose a new password.</p>
                      <div>
                        <form className="authentication-form" onSubmit={onConfirm} autoComplete="off">
                          {/* Anti-autofill dummy fields */}
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                          />
                          <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                          />
                          <input
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                          />
                          <Controller
                            name="otp"
                            control={confirmControl}
                            render={({ field, fieldState }) => (
                              <FormGroup className="mb-3">
                                <FormLabel htmlFor="otp-id">Reset Code</FormLabel>
                                <FormControl
                                  id="otp-id"
                                  placeholder="Enter 4-digit code"
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  autoCapitalize="none"
                                  spellCheck={false}
                                  maxLength={4}
                                  readOnly={otpReadOnly}
                                  value={field.value}
                                  onFocus={() => { setOtpReadOnly(false); setConfirmValue('otp', '') }}
                                  onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                                    field.onChange(digits)
                                  }}
                                  isInvalid={Boolean(fieldState.error?.message)}
                                />
                              </FormGroup>
                            )}
                          />
                          <PasswordFormInput
                            control={confirmControl}
                            name="newPassword"
                            containerClassName="mb-3"
                            placeholder="Enter new password"
                            id="new-password-id"
                            label={<label className="form-label" htmlFor="new-password-id">New Password</label>}
                          />
                          <PasswordFormInput
                            control={confirmControl}
                            name="confirmPassword"
                            containerClassName="mb-3"
                            placeholder="Confirm new password"
                            id="confirm-password-id"
                            label={<label className="form-label" htmlFor="confirm-password-id">Confirm Password</label>}
                          />
                          <div className="mb-1 d-grid">
                            <Button variant="primary" type="submit" disabled={confirming}>
                              {confirming ? 'Resetting…' : 'Reset Password'}
                            </Button>
                          </div>
                          <div className="text-center mt-2">
                            <Button variant="link" className="p-0" onClick={() => setStep('request')}>
                              Use a different email
                            </Button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                  <p className="mt-5 text-danger text-center">
                    Back to
                    <Link href="/auth/sign-in" className="text-dark fw-bold ms-1">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xxl={5} className="d-none d-xxl-flex">
            <Card className="h-100 mb-0 overflow-hidden">
              <div className="d-flex flex-column h-100">
                <Image src={smallImg} height={867} width={759} alt="small-img" className="w-100 h-100" />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ResetPassword
