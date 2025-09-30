'use client'

import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import { useGetShippingPolicyQuery, useUpdateShippingPolicyMutation } from '@/store/shippingPolicyApi'

const PrivacyPolicyPage = () => {
  const [policyText, setPolicyText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: privacyPolicy, isLoading, isError } = useGetShippingPolicyQuery()
  const [updatePrivacyPolicy, { isLoading: isUpdating }] = useUpdateShippingPolicyMutation()

  useEffect(() => {
    if (privacyPolicy) {
      setPolicyText(privacyPolicy.content)
    }
  }, [privacyPolicy])

  const handleChange = (value: string) => {
    setPolicyText(value)
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleSave = async () => {
    try {
      await updatePrivacyPolicy({ content: policyText }).unwrap()
      showMessage('Shipping policy updated successfully', 'success')
    } catch (error) {
      console.error('Error updating Shipping policy:', error)
      showMessage('Failed to update Shipping policy', 'error')
    }
  }

  if (isLoading) {
    return <div className="text-center py-5">Loading Shipping policy...</div>
  }

  if (isError) {
    return <div className="text-center py-5 text-danger">Error loading Shipping policy</div>
  }

  return (
    <>
      <PageTItle title="Shipping Policy" />
      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Shipping Policy
            </label>
            <ReactQuill
              value={policyText}
              onChange={handleChange}
              theme="snow"
              style={{ minHeight: '300px', height: '300px', marginBottom: '3rem' }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ color: [] }, { background: [] }],
                  ['link'],
                  ['clean'],
                ],
              }}
            />
          </div>
        </Col>
      </Row>
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <button className="btn btn-outline-secondary w-100" onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <span className="d-flex align-items-center justify-content-center">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </Col>
        </Row>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999, top: 20, right: 20 }}>
          <div className={`toast show align-items-center text-white bg-${toastVariant === 'error' ? 'danger' : 'success'}`} role="alert">
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

export default PrivacyPolicyPage
