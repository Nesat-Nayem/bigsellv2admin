"use client"

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import {
  useCreateIncludeMutation,
  useDeleteIncludeMutation,
  useGetIncludesQuery,
  useToggleIncludeMutation,
} from '@/store/subscriptionIncludesApi'

const IncludesAdd = () => {
  const [title, setTitle] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const { data, isLoading, isError, refetch } = useGetIncludesQuery({ page, limit, search: search || undefined })
  const items = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || Math.ceil(items.length / limit) || 1

  const [createInclude, { isLoading: isCreating }] = useCreateIncludeMutation()
  const [deleteInclude, { isLoading: isDeleting }] = useDeleteIncludeMutation()
  const [toggleInclude, { isLoading: isToggling }] = useToggleIncludeMutation()

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [toastVariant, setToastVariant] = React.useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = React.useState(false)
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createInclude({ title }).unwrap()
      setTitle('')
      showMessage('Include created!', 'success')
    } catch (err: any) {
      console.error('Create include failed', err)
      showMessage(err?.data?.message || 'Failed to create include', 'error')
    }
  }

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this include?')) return
    try {
      await deleteInclude(id).unwrap()
      showMessage('Include deleted!', 'success')
    } catch (err: any) {
      console.error('Delete include failed', err)
      showMessage(err?.data?.message || 'Failed to delete include', 'error')
    }
  }

  const onToggle = async (id: string, current: boolean) => {
    try {
      await toggleInclude({ id, isActive: !current }).unwrap()
      showMessage(`Include ${!current ? 'activated' : 'deactivated'}!`, 'success')
    } catch (err: any) {
      console.error('Toggle include failed', err)
      showMessage(err?.data?.message || 'Failed to toggle include', 'error')
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1 flex-wrap">
          <CardTitle as={'h4'}>Create Includes</CardTitle>
          <div className="d-flex gap-2">
            <input
              placeholder="Search includes..."
              className="form-control"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ maxWidth: 260 }}
            />
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form onSubmit={onCreate}>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <Button variant="success" type="submit" disabled={isCreating}>
                  Save
                </Button>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            Plan Includes ({total})
          </CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading includes...</p>
            </div>
          ) : isError ? (
            <div className="text-danger text-center py-4">
              <p>Failed to load includes</p>
              <button className="btn btn-outline-danger" onClick={() => refetch()}>Try Again</button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ textWrap: 'nowrap' }}>Name</th>
                      <th style={{ textWrap: 'nowrap' }}>Status</th>
                      <th style={{ textWrap: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-3 text-muted">No includes found</td>
                      </tr>
                    ) : (
                      items.map((inc) => (
                        <tr key={inc._id}>
                          <td>{inc.title}</td>
                          <td>
                            <span
                              className={`badge ${inc.isActive ? 'bg-success' : 'bg-danger'}`}
                              role="button"
                              onClick={() => onToggle(inc._id, inc.isActive !== false)}
                              style={{ cursor: 'pointer' }}
                            >
                              {inc.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link href={`/subscription/includes-edit?id=${inc._id}`} className="btn btn-soft-primary btn-sm">
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Link>
                              <button className="btn btn-soft-danger btn-sm" onClick={() => onDelete(inc._id)} disabled={isDeleting}>
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

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">Page {page} of {totalPages} • Total {total} includes</div>
                <div className="d-flex align-items-center gap-2">
                  <select className="form-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} style={{ width: 'auto' }}>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const pageNum = start + i
                      return (
                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
                        </li>
                      )
                    })}
                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
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

export default IncludesAdd
