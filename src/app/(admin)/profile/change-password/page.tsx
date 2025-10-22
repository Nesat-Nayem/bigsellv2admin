'use client'
import React, { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { user, token } = useSelector((state: RootState) => state.auth)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/v1/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('🎉 Password changed successfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        throw new Error(data.message || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('Password change error:', error)
      
      let errorMessage = 'Failed to change password'
      if (error.message) {
        errorMessage = error.message
      }
      
      // Handle specific error cases
      if (error.message?.includes('Current password is incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' })
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={10}>
        <Card>
          <CardHeader className="bg-light">
            <CardTitle as="h4" className="mb-0 text-dark">
              🔐 Change Password
            </CardTitle>
            <small className="text-muted">
              Keep your account secure by using a strong password
            </small>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <Alert variant="info" className="d-flex align-items-center">
                <i className="fa fa-info-circle me-2"></i>
                <div>
                  <strong>Password Requirements:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Minimum 6 characters long</li>
                    <li>Must be different from your current password</li>
                    <li>Use a combination of letters, numbers, and symbols for better security</li>
                  </ul>
                </div>
              </Alert>
            </div>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12} className="mb-4">
                  <Form.Label className="fw-semibold">
                    Current Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.currentPassword}
                    placeholder="Enter your current password"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">
                    New Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.newPassword}
                    placeholder="Enter your new password"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">
                    Confirm New Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Confirm your new password"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted small">
                  <i className="fa fa-shield-alt me-1"></i>
                  Your password will be encrypted and stored securely
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #007bff, #0056b3)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-key me-2"></i>
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </Form>

            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="fw-semibold mb-2">Security Tips:</h6>
              <ul className="small text-muted mb-0">
                <li>Don&apos;t use the same password for multiple accounts</li>
                <li>Avoid using personal information in passwords</li>
                <li>Consider using a password manager</li>
                <li>Log out from public computers after use</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default ChangePasswordPage
