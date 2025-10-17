'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetOrdersQuery, useGetVendorOrdersQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation } from '@/store/orderApi'
import { currency } from '@/context/constants'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import type { RootState as IRootState } from '@/store'

const OrdersList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [limit] = useState(10) // Items per page
  
  const role = useSelector((s: IRootState) => (s as any)?.auth?.user?.role)

  const { data: adminData, isLoading: adminLoading, error: adminError } = useGetOrdersQuery({
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  }, { skip: role === 'vendor' } as any)

  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useGetVendorOrdersQuery({
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  }, { skip: role !== 'vendor' } as any)

  const data = role === 'vendor' ? vendorData : adminData
  const isLoading = role === 'vendor' ? vendorLoading : adminLoading
  const error = role === 'vendor' ? vendorError : adminError
  
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const orders = data?.orders || []
  const pagination = data?.pagination

  console.log('Orders Data:', data)
  console.log('Orders:', orders)
  console.log('Pagination:', pagination)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (pagination?.hasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId)
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap()
      alert('Order status updated successfully!')
    } catch (error: any) {
      console.error('Update error:', error)
      alert(error?.data?.message || 'Failed to update order status')
    } finally {
      setIsUpdating(null)
    }
  }

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      setIsUpdating(orderId)
      await updatePaymentStatus({ id: orderId, paymentStatus: newPaymentStatus }).unwrap()
      alert('Payment status updated successfully!')
    } catch (error: any) {
      console.error('Update error:', error)
      alert(error?.data?.message || 'Failed to update payment status')
    } finally {
      setIsUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-soft-warning text-warning',
      confirmed: 'bg-soft-info text-info',
      shipped: 'bg-soft-primary text-primary',
      delivered: 'bg-soft-success text-success',
      cancelled: 'bg-soft-danger text-danger',
    }
    return statusMap[status] || 'bg-soft-secondary text-secondary'
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-soft-warning text-warning',
      paid: 'bg-soft-success text-success',
      failed: 'bg-soft-danger text-danger',
    }
    return statusMap[status] || 'bg-soft-secondary text-secondary'
  }

  if (isLoading) return <div className="d-flex justify-content-center p-4"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>
  if (error) return <div className="alert alert-danger">Error loading orders</div>
  return (
    <>
      <style jsx global>{`
        .status-dropdown .dropdown-toggle::after {
          display: none !important;
        }
        .status-dropdown .dropdown-toggle {
          cursor: pointer;
        }
      `}</style>
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader>
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <CardTitle as={'h4'} className="flex-grow-1 mb-0">
                All Order List
              </CardTitle>
            </div>
            
            {/* Search and Filters */}
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders by ID, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Payment</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div className="col-md-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  <IconifyIcon icon="solar:magnifer-linear" className="align-middle fs-18" />
                </button>
                {(searchTerm || statusFilter || paymentStatusFilter) && (
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('')
                      setPaymentStatusFilter('')
                      setCurrentPage(1)
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
            
            {/* Results Info */}
            {pagination && (
              <div className="mt-2">
                <small className="text-muted">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  {searchTerm && ` for "${searchTerm}"`}
                </small>
              </div>
            )}
          </CardHeader>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ textWrap: 'nowrap' }}>Order ID</th>
                    <th style={{ textWrap: 'nowrap' }}>Customer</th>
                    <th style={{ textWrap: 'nowrap' }}>Email</th>
                    <th style={{ textWrap: 'nowrap' }}>Phone</th>
                    <th style={{ textWrap: 'nowrap' }}>Items</th>
                    <th style={{ textWrap: 'nowrap' }}>Total Amount</th>
                    <th style={{ textWrap: 'nowrap' }}>Order Date</th>
                    <th style={{ textWrap: 'nowrap' }}>Payment Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Order Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link href={`/orders/order-detail/${order._id}`} className="text-primary fw-medium">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{order.user?.name || 'N/A'}</div>
                          </div>
                        </td>
                        <td>{order.user?.email || 'N/A'}</td>
                        <td>{order.user?.phone || 'N/A'}</td>
                        <td>
                          <div>
                            <small className="text-muted">{order.items?.length || 0} item(s)</small>
                            {order.items?.[0] && (
                              <div className="fw-medium fs-13">{order.items[0].name}</div>
                            )}
                            {(order.items?.length || 0) > 1 && (
                              <small className="text-muted">+{(order.items?.length || 0) - 1} more</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium">{currency}{order.totalAmount?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td>{formatDate(order.orderDate || order.createdAt)}</td>
                        <td>
                          <Dropdown className="status-dropdown">
                            <Dropdown.Toggle 
                              as="button" 
                              className={`btn btn-sm badge ${getPaymentStatusBadge(order.paymentStatus)} border-0 d-inline-flex align-items-center gap-1`}
                              disabled={isUpdating === order._id}
                              style={{ padding: '0.35rem 0.65rem' }}
                            >
                              <IconifyIcon 
                                icon={
                                  order.paymentStatus === 'paid' ? 'solar:check-circle-bold' :
                                  order.paymentStatus === 'failed' ? 'solar:close-circle-bold' :
                                  'solar:clock-circle-bold'
                                } 
                                className="fs-14" 
                              />
                              <span className="text-capitalize">{order.paymentStatus || 'pending'}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handlePaymentStatusUpdate(order._id, 'pending')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:clock-circle-bold" className="fs-16 text-warning" />
                                Pending
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handlePaymentStatusUpdate(order._id, 'paid')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:check-circle-bold" className="fs-16 text-success" />
                                Paid
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handlePaymentStatusUpdate(order._id, 'failed')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:close-circle-bold" className="fs-16 text-danger" />
                                Failed
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                        <td>
                          <Dropdown className="status-dropdown">
                            <Dropdown.Toggle 
                              as="button" 
                              className={`btn btn-sm badge ${getStatusBadge(order.status)} border-0 d-inline-flex align-items-center gap-1`}
                              disabled={isUpdating === order._id}
                              style={{ padding: '0.35rem 0.65rem' }}
                            >
                              <IconifyIcon 
                                icon={
                                  order.status === 'delivered' ? 'solar:check-circle-bold' :
                                  order.status === 'shipped' ? 'solar:delivery-bold' :
                                  order.status === 'confirmed' ? 'solar:verified-check-bold' :
                                  order.status === 'cancelled' ? 'solar:close-circle-bold' :
                                  'solar:clock-circle-bold'
                                } 
                                className="fs-14" 
                              />
                              <span className="text-capitalize">{order.status || 'pending'}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'pending')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:clock-circle-bold" className="fs-16 text-warning" />
                                Pending
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'confirmed')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:verified-check-bold" className="fs-16 text-info" />
                                Confirmed
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'shipped')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:delivery-bold" className="fs-16 text-primary" />
                                Shipped
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'delivered')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:check-circle-bold" className="fs-16 text-success" />
                                Delivered
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'cancelled')} className="d-flex align-items-center gap-2">
                                <IconifyIcon icon="solar:close-circle-bold" className="fs-16 text-danger" />
                                Cancelled
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/orders/order-detail/${order._id}`} className="btn btn-soft-info btn-sm" title="View Details">
                              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        <div className="d-flex flex-column align-items-center">
                          <IconifyIcon icon="solar:inbox-broken" className="fs-48 text-muted mb-2" />
                          <p className="text-muted mb-0">No orders found</p>
                          {searchTerm && <small className="text-muted">Try adjusting your search terms</small>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>

          {pagination && pagination.totalPages > 1 && (
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Page {pagination.page} of {pagination.totalPages}
                  </small>
                </div>
                
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={handlePrevious}
                        disabled={!pagination.hasPrevPage}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const pages = []
                      const totalPages = pagination.totalPages
                      const current = pagination.page
                      
                      // Always show first page
                      if (current > 3) {
                        pages.push(
                          <li key={1} className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(1)}>
                              1
                            </button>
                          </li>
                        )
                        if (current > 4) {
                          pages.push(
                            <li key="start-ellipsis" className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )
                        }
                      }
                      
                      // Show pages around current page
                      for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
                        pages.push(
                          <li key={i} className={`page-item ${i === current ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(i)}
                              disabled={i === current}
                            >
                              {i}
                            </button>
                          </li>
                        )
                      }
                      
                      // Always show last page
                      if (current < totalPages - 2) {
                        if (current < totalPages - 3) {
                          pages.push(
                            <li key="end-ellipsis" className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )
                        }
                        pages.push(
                          <li key={totalPages} className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                              {totalPages}
                            </button>
                          </li>
                        )
                      }
                      
                      return pages
                    })()}
                    
                    <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={handleNext}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </CardFooter>
          )}
        </Card>
      </Col>
    </Row>
    </>
  )
}

export default OrdersList
