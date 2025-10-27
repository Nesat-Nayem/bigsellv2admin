'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetGeneralSettingsQuery, useUpdateGeneralSettingsMutation } from '@/store/generalSettingsApi'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const GeneralSettings = () => {
  const [formData, setFormData] = useState({
    number: '',
    email: '',
    facebook: '',
    instagram: '',
    linkedIn: '',
    twitter: '',
    youtube: '',
    headerTab: '',
    iframe: '',
    address: '',
    favicon: null as File | null,
    logo: null as File | null,
  })

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: generalSettings, isLoading, isError } = useGetGeneralSettingsQuery()
  const [updateGeneralSettings, { isLoading: isUpdating }] = useUpdateGeneralSettingsMutation()

  useEffect(() => {
    if (generalSettings) {
      setFormData({
        number: generalSettings.number || '',
        email: generalSettings.email || '',
        facebook: generalSettings.facebook || '',
        instagram: generalSettings.instagram || '',
        linkedIn: generalSettings.linkedIn || '',
        twitter: generalSettings.twitter || '',
        youtube: generalSettings.youtube || '',
        headerTab: generalSettings.headerTab || '',
        iframe: generalSettings.iframe || '',
        address: generalSettings.address || '',
        favicon: null,
        logo: null,
      })
    }
  }, [generalSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value && typeof value === 'string') data.append(key, value)
      })
      if (formData.favicon) data.append('favicon', formData.favicon)
      if (formData.logo) data.append('logo', formData.logo)

      await updateGeneralSettings(data).unwrap()
      showMessage('General Settings updated successfully', 'success')
    } catch (error) {
      console.error('Error updating General Settings:', error)
      showMessage('Failed to update General Settings', 'error')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading General Settings</div>

  return (
    <>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'} className="d-flex align-items-center gap-1">
                <IconifyIcon icon="solar:settings-bold-duotone" className="text-primary fs-20" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSave}>
                <Row>
                  
                  <Col lg={4}>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input type="email" name="email" className="form-control" />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input type="password" name="password" className="form-control" />
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input type="password" name="password" className="form-control" />
                    </div>
                  </Col>

                  <Col lg={12} className="text-end">
                    <Button type="submit" variant="success" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-white bg-${toastVariant === 'error' ? 'danger' : 'success'}`}>
            <div className="d-flex">
              <div className="toast-body">{toastMessage}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GeneralSettings
