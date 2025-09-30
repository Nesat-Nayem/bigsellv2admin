"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import {
  useDeleteSubscriptionMutation,
  useSearchSubscriptionsQuery,
  useToggleSubscriptionMutation,
  ISubscription,
} from '@/store/subscriptionApi'

const SubscriptionList = () => {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')

  const { data, isLoading, isError, refetch } = useSearchSubscriptionsQuery({
    page,
    limit,
    search: search || undefined,
    active: statusFilter === 'all' ? undefined : statusFilter === 'active',
  })

  const items = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || Math.ceil(items.length / limit) || 1

  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation()
  const [toggleSubscription, { isLoading: isToggling }] = useToggleSubscriptionMutation()

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [toastVariant, setToastVariant] = React.useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = React.useState(false)
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return
    try {
      await deleteSubscription(id).unwrap()
      showMessage('Subscription deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete subscription', 'error')
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleSubscription({ id, isActive: !current }).unwrap()
      showMessage(`Subscription ${!current ? 'activated' : 'deactivated'} successfully!`, 'success')
    } catch (error: any) {
      console.error('Toggle failed:', error)
      showMessage(error?.data?.message || 'Failed to toggle subscription', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading subscriptions...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-danger text-center py-4">
        <p>Failed to load subscriptions</p>
        <button className="btn btn-outline-danger" onClick={() => refetch()}>Try Again</button>
      </div>
    )
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1 flex-wrap">
              <CardTitle as={'h4'} className="flex-grow-1">All Subscription List ({total})</CardTitle>
              <div className="d-flex gap-2 align-items-center">
                <Link href="/subscription/subscription-add" className="btn btn-sm btn-success">
                  + Add Subscription
                </Link>
              </div>
            </CardHeader>
            <div className="card-body border-bottom">
              <Row className="g-2">
                <Col md={6}>
                  <div className="position-relative">
                    <input type="text" className="form-control" placeholder="Search subscriptions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-2 justify-content-md-end">
                    <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1) }} style={{ width: 'auto' }}>
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select className="form-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} style={{ width: 'auto' }}>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </Col>
              </Row>
            </div>
            <div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" disabled id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1" />
                        </div>
                      </th>
                      <th>Plan Name</th>
                      <th>Plan Cost</th>
                      <th>Plan Includes</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">No subscriptions found</td>
                      </tr>
                    ) : (
                      items.map((plan: ISubscription) => (
                        <tr key={plan._id}>
                          <td>
                            <div className="form-check">
                              <input type="checkbox" className="form-check-input" disabled />
                              <label className="form-check-label" />
                            </div>
                          </td>
                          <td>{plan.name}</td>
                          <td>₹{plan.price}</td>
                          <td>
                            <div>
                              <ul>
                                {(plan.features || []).slice(0, 5).map((f, idx) => (
                                  <li key={idx}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${plan.isActive ? 'bg-success' : 'bg-danger'}`}
                              role="button"
                              onClick={() => handleToggle(plan._id, plan.isActive)}
                              style={{ cursor: 'pointer' }}
                            >
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/subscription/subscription-edit/${plan._id}`} className="btn btn-soft-info btn-sm">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <button className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(plan._id)} disabled={isDeleting}>
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">Page {page} of {totalPages} • Total {total} subscriptions</div>
                <nav aria-label="Subscription pagination">
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const pageNum = start + index
                      return (
                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}
                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default SubscriptionList
