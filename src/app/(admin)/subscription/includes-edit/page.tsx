"use client"

import React from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useSearchParams, useRouter } from 'next/navigation'
import { useGetIncludeByIdQuery, useUpdateIncludeMutation } from '@/store/subscriptionIncludesApi'
import Link from 'next/link'

const IncludesEdit = () => {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id') || ''

  const { data: include, isLoading, isError, refetch } = useGetIncludeByIdQuery(id, { skip: !id })
  const [updateInclude, { isLoading: isUpdating }] = useUpdateIncludeMutation()

  const [title, setTitle] = React.useState('')
  const [isActive, setIsActive] = React.useState(true)

  React.useEffect(() => {
    if (include) {
      setTitle(include.title || '')
      setIsActive(include.isActive !== false)
    }
  }, [include])

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [toastVariant, setToastVariant] = React.useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = React.useState(false)
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await updateInclude({ id, data: { title, isActive } }).unwrap()
      showMessage('Include updated!', 'success')
      setTimeout(() => router.push('/subscription/includes-add'), 400)
    } catch (err: any) {
      console.error('Update include failed', err)
      showMessage(err?.data?.message || 'Failed to update include', 'error')
    }
  }

  if (!id) {
    return (
      <div className="text-center py-4">
        <p className="text-danger">Missing include id</p>
        <Link href="/subscription/includes-add" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p>Loading include...</p>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="text-center py-4">
        <p className="text-danger">Failed to load include.</p>
        <button className="btn btn-outline-danger" onClick={() => refetch()}>Try Again</button>
      </div>
    )
  }

  return (
    <Container>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as={'h4'}>Edit Include</CardTitle>
          <Link href="/subscription/includes-add" className="btn btn-outline-secondary btn-sm">Back</Link>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form onSubmit={onSave}>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="activeSwitch" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <label className="form-check-label" htmlFor="activeSwitch">Active</label>
                </div>

                <Button variant="success" type="submit" className="w-auto" disabled={isUpdating}>
                  Save
                </Button>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default IncludesEdit
