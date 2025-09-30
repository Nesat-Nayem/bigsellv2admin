"use client"

import React from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import { useGetSubscriptionByIdQuery, useUpdateSubscriptionMutation } from '@/store/subscriptionApi'
import { useGetIncludesQuery } from '@/store/subscriptionIncludesApi'

const SubscriptionEdit = () => {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)

  const { data: plan, isLoading, isError, refetch } = useGetSubscriptionByIdQuery(id || '', { skip: !id })
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation()

  const [name, setName] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [metaTitle, setMetaTitle] = React.useState('')
  const [metaTag, setMetaTag] = React.useState('')
  const [metaDescription, setMetaDescription] = React.useState('')
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly')
  const [color, setColor] = React.useState<string>('secondary')
  const [selectedIncludeIds, setSelectedIncludeIds] = React.useState<string[]>([])

  const { data: includesData } = useGetIncludesQuery({ active: true, page: 1, limit: 100 })
  const includesOptions = includesData?.items || []

  React.useEffect(() => {
    if (plan) {
      setName(plan.name || '')
      setPrice(plan.price != null ? String(plan.price) : '')
      setMetaTitle(plan.metaTitle || '')
      setMetaTag((plan.metaTags || []).join(', '))
      setMetaDescription(plan.metaDescription || '')
      setBillingCycle((plan.billingCycle as any) || 'monthly')
      setColor(plan.color || 'secondary')
      setSelectedIncludeIds(plan.includeIds || [])
    }
  }, [plan])

  const toggleInclude = (id: string, checked: boolean) => {
    setSelectedIncludeIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [toastVariant, setToastVariant] = React.useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = React.useState(false)
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onUpdate = async () => {
    if (!id) return
    try {
      const body = {
        name,
        price: Number(price) || 0,
        billingCycle,
        color,
        includeIds: selectedIncludeIds,
        metaTitle: metaTitle || undefined,
        metaTags: metaTag ? metaTag.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        metaDescription: metaDescription || undefined,
      }
      await updateSubscription({ id, data: body }).unwrap()
      showMessage('Subscription updated successfully!', 'success')
      setTimeout(() => router.push('/subscription/subscription-list'), 500)
    } catch (error: any) {
      console.error('Update subscription failed:', error)
      showMessage(error?.data?.message || 'Failed to update subscription', 'error')
    }
  }

  if (!id) {
    return (
      <div className="text-center py-4">
        <p className="text-danger">Invalid subscription id.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p>Loading plan...</p>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="text-center py-4">
        <p className="text-danger">Failed to load plan.</p>
        <button className="btn btn-outline-danger" onClick={() => refetch()}>Try Again</button>
      </div>
    )
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Edit Plan</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Plan Name
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Plan Cost
                </label>
                <div className="input-group mb-3">
                  <input type="number" id="Sub" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="billing" className="form-label">Billing Cycle</label>
                <div className="input-group mb-3">
                  <select id="billing" className="form-select" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="color" className="form-label">Color</label>
                <div className="input-group mb-3">
                  <select id="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
                    <option value="secondary">Secondary</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="danger">Danger</option>
                    <option value="primary">Primary</option>
                  </select>
                </div>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Plan Includes</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {includesOptions.map((inc, idx) => (
              <Col md={6} key={idx}>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`inc-${idx}`}
                    value={inc._id}
                    checked={selectedIncludeIds.includes(inc._id)}
                    onChange={(e) => toggleInclude(inc._id, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`inc-${idx}`}>
                    {inc.title}
                  </label>
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>SEO Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="handshake" className="form-label">
                  Meta Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="handshake" className="form-control" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Meta Tag
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" placeholder="tag1, tag2" value={metaTag} onChange={(e) => setMetaTag(e.target.value)} />
                </div>
              </form>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Meta Description
                </label>
                <textarea className="form-control bg-light-subtle" id="description" rows={7} placeholder="" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="success" type="button" className="w-100" onClick={onUpdate} disabled={isUpdating}>
              Update
            </Button>
          </Col>
        </Row>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default SubscriptionEdit
