'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { setUser } from '@/store/authSlice'

const UpdateProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { user, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
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
      const response = await fetch(`${apiUrl}/v1/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update user data in Redux store
        dispatch(setUser(data.data))

        toast.success('🎉 Profile updated successfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } else {
        throw new Error(data.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      
      let errorMessage = 'Failed to update profile'
      if (error.message) {
        errorMessage = error.message
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
              👤 Update Profile
            </CardTitle>
            <small className="text-muted">
              Keep your account information up to date
            </small>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <Alert variant="info" className="d-flex align-items-center">
                <i className="fa fa-info-circle me-2"></i>
                <div>
                  <strong>Account Type:</strong> {user?.role || 'User'} • 
                  <strong className="ms-2">Status:</strong> 
                  <span className="badge bg-success ms-1">Active</span>
                </div>
              </Alert>
            </div>

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter your full name"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email address"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">
                    Phone Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phone}
                    placeholder="Enter your phone number"
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-4">
                  <Form.Label className="fw-semibold">Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.role || 'User'}
                    disabled
                    style={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                  <Form.Text className="text-muted">
                    Role cannot be changed
                  </Form.Text>
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted small">
                  <i className="fa fa-shield-alt me-1"></i>
                  Your information is kept secure and private
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i>
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default UpdateProfilePage
