'use client'

import React, { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import { useGetHelpSupportQuery, useUpdateHelpSupportMutation } from '@/store/helpSupportApi'

const HelpCenter = () => {
  const [HelpCenterText, setHelpCenterText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: helpCenter, isLoading, isError } = useGetHelpSupportQuery()
  const [updateHelpCenter, { isLoading: isUpdating }] = useUpdateHelpSupportMutation()

  useEffect(() => {
    if (helpCenter) {
      setHelpCenterText(helpCenter.content || '')
    }
  }, [helpCenter])

  const handleChange = (value: string) => {
    setHelpCenterText(value)
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleSave = async () => {
    try {
      await updateHelpCenter({ content: HelpCenterText }).unwrap()
      showMessage('Help Center updated successfully', 'success')
    } catch (error) {
      console.error('Error updating Help Center:', error)
      showMessage('Failed to update Help Center', 'error')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading Help Center</div>

  return (
    <>
      <PageTItle title="Help Center" />
      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <ReactQuill
              value={HelpCenterText}
              onChange={handleChange}
              theme="snow"
              placeholder=""
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
            <Button onClick={handleSave} className="success w-100" disabled={isUpdating}>
              {isUpdating ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </Col>
        </Row>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999, top: 20, right: 20 }}>
          <div className={`toast show align-items-center text-white bg-${toastVariant === 'error' ? 'danger' : 'success'}`}>
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

export default HelpCenter
