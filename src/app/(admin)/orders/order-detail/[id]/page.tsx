'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, Row, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import PageTItle from '@/components/PageTItle'
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation, useCreateDelhiveryShipmentMutation, useScheduleDelhiveryPickupMutation, useLazyGetDelhiveryLabelQuery, useLazyTrackDelhiveryQuery } from '@/store/orderApi'
import { toast } from 'react-toastify'

function formatCurrency(amount?: number) {
  if (typeof amount !== 'number') return '-'
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `₹ ${amount.toFixed(2)}`
  }
}

function StatusPill({ value }: { value?: string }) {
  if (!value) return null
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
    returned: 'secondary',
  }
  const variant = map[value] || 'secondary'
  return (
    <Badge bg={variant} className="text-uppercase">
      {value}
    </Badge>
  )
}

export default function AdminOrderDetailPage() {
  const params = useParams() as { id?: string | string[] }
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id

  const { data: order, isLoading, isFetching, error, refetch } = useGetOrderByIdQuery(id ?? '', { skip: !id }) as any
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation()
  const [isUpdating, setIsUpdating] = useState(false)
  const [createShipment, { isLoading: creatingShipment }] = useCreateDelhiveryShipmentMutation()
  const [schedulePickup, { isLoading: schedulingPickup }] = useScheduleDelhiveryPickupMutation()
  const [triggerLabel, { isFetching: fetchingLabel }] = useLazyGetDelhiveryLabelQuery()
  const [triggerTrack, { isFetching: fetchingTrack, data: trackData }] = useLazyTrackDelhiveryQuery()

  const handleCreateDelhiveryShipment = async () => {
    if (!id) return
    try {
      setIsUpdating(true)
      await createShipment({ id }).unwrap()
      toast.success('Delhivery shipment created. Order marked as shipped.')
      await refetch()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.data?.message || 'Failed to create Delhivery shipment')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSchedulePickup = async () => {
    if (!id) return
    try {
      setIsUpdating(true)
      const expectedPackageCount = (order?.items?.length || 1)
      const now = new Date()
      const d = new Date(now)
      let slot = '11:00-15:00'
      const h = now.getHours()
      if (h < 11) {
        slot = '11:00-15:00'
      } else if (h < 15) {
        slot = '15:00-19:00'
      } else {
        d.setDate(d.getDate() + 1)
        slot = '11:00-15:00'
      }
      const pickupDate = d.toISOString().slice(0, 10)
      await schedulePickup({ id, expectedPackageCount, pickup: { date: pickupDate, time: slot } }).unwrap()
      toast.success('Pickup scheduled with Delhivery')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.data?.message || 'Failed to schedule pickup')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownloadLabel = async () => {
    if (!id) return
    try {
      const res = await triggerLabel({ id }).unwrap()
      const b64 = (res as any)?.pdfBase64
      if (!b64) throw new Error('No label data')
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${b64}`
      link.download = `${order?.orderNumber || id}-label.pdf`
      link.click()
      toast.success('Label downloaded successfully!')
    } catch (e: any) {
      console.error(e)
      const msg = e?.data?.message || 'Failed to download label'
      toast.error(
        <div>
          <div>{msg}</div>
          <div className="mt-2 small">
            <strong>Alternative:</strong> Download from{' '}
            <a href="https://one.delhivery.com" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-underline">
              Delhivery Dashboard
            </a>
          </div>
        </div>,
        { autoClose: 8000 }
      )
    }
  }

  const handleTrack = async () => {
    if (!id) return
    try {
      await triggerTrack({ id }).unwrap()
      toast.success('Tracking updated')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.data?.message || 'Failed to fetch tracking')
    }
  }
  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    if (!id) return
    try {
      setIsUpdating(true)
      await updateOrderStatus({ 
        id, 
        status: newStatus, 
        note: note || `Status changed to ${newStatus} by admin` 
      }).unwrap()
      toast.success('Order status updated successfully!')
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error?.data?.message || 'Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
    if (!id) return
    try {
      setIsUpdating(true)
      await updatePaymentStatus({ id, paymentStatus: newPaymentStatus }).unwrap()
      toast.success('Payment status updated successfully!')
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error?.data?.message || 'Failed to update payment status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'bg-soft-warning text-warning',
      confirmed: 'bg-soft-info text-info',
      shipped: 'bg-soft-primary text-primary',
      delivered: 'bg-soft-success text-success',
      cancelled: 'bg-soft-danger text-danger',
      returned: 'bg-soft-secondary text-secondary',
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
      <PageTItle title="ORDER DETAILS" />

      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 className="mb-1">
            {order?.orderNumber ? (
              <>
                Order <span className="text-primary">{order.orderNumber}</span>
              </>
            ) : id ? (
              <>
                Order <span className="text-primary">#{String(id).slice(-6)}</span>
              </>
            ) : (
              'Order Details'
            )}
          </h3>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="text-muted">
              {order?.createdAt && <>Placed on {new Date(order.createdAt).toLocaleString()}</>}
            </div>
            
            {/* Order Status Dropdown */}
            {order?.status && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Order Status:</span>
                <Dropdown className="status-dropdown">
                  <Dropdown.Toggle 
                    as="button" 
                    className={`btn btn-sm badge ${getStatusBadge(order.status)} border-0 d-inline-flex align-items-center gap-1`}
                    disabled={isUpdating}
                    style={{ padding: '0.35rem 0.65rem' }}
                  >
                    <IconifyIcon 
                      icon={
                        order.status === 'delivered' ? 'solar:check-circle-bold' :
                        order.status === 'shipped' ? 'solar:delivery-bold' :
                        order.status === 'confirmed' ? 'solar:verified-check-bold' :
                        order.status === 'cancelled' ? 'solar:close-circle-bold' :
                        order.status === 'returned' ? 'solar:restart-bold' :
                        'solar:clock-circle-bold'
                      } 
                      className="fs-14" 
                    />
                    <span className="text-capitalize">{order.status}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleStatusUpdate('pending')}>
                      <IconifyIcon icon="solar:clock-circle-broken" className="me-2" />
                      Pending
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate('confirmed')}>
                      <IconifyIcon icon="solar:check-circle-broken" className="me-2" />
                      Confirmed
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate('shipped')}>
                      <IconifyIcon icon="solar:delivery-broken" className="me-2" />
                      Shipped
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate('delivered')}>
                      <IconifyIcon icon="solar:box-broken" className="me-2" />
                      Delivered
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate('cancelled')}>
                      <IconifyIcon icon="solar:close-circle-broken" className="me-2" />
                      Cancelled
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate('returned')}>
                      <IconifyIcon icon="solar:restart-broken" className="me-2" />
                      Returned
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
            
            {/* Payment Status Dropdown */}
            {order?.paymentStatus && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Payment:</span>
                <Dropdown className="status-dropdown">
                  <Dropdown.Toggle 
                    as="button" 
                    className={`btn btn-sm badge ${getPaymentStatusBadge(order.paymentStatus)} border-0 d-inline-flex align-items-center gap-1`}
                    disabled={isUpdating}
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
                    <span className="text-capitalize">{order.paymentStatus}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handlePaymentStatusUpdate('pending')}>
                      <IconifyIcon icon="solar:clock-circle-broken" className="me-2" />
                      Pending
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handlePaymentStatusUpdate('paid')}>
                      <IconifyIcon icon="solar:card-broken" className="me-2" />
                      Paid
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handlePaymentStatusUpdate('failed')}>
                      <IconifyIcon icon="solar:close-circle-broken" className="me-2" />
                      Failed
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
            
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => window.print()}>
            <IconifyIcon icon="solar:printer-broken" className="me-1" /> Print
          </button>
          <Link href="/orders/orders-list" className="btn btn-outline-secondary">
            <IconifyIcon icon="solar:arrow-left-broken" className="me-1" /> Back to list
          </Link>
        </div>
      </div>

      {(isLoading || isFetching) && (
        <Card className="mb-3">
          <CardBody>
            <div className="alert alert-info mb-0">Loading order…</div>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="mb-3">
          <CardBody>
            <div className="alert alert-danger mb-0">Failed to load order details.</div>
          </CardBody>
        </Card>
      )}

      {order && (
        <Row>
          {/* Left: Items & Timeline */}
          <Col xl={9} lg={8}>
            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Items ({order.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table hover bordered={false} className="align-middle">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((it: any, idx: number) => {
                        const name = it?.name || it?.product?.name || '-'
                        const price = it?.price ?? it?.product?.price
                        const qty = it?.quantity ?? 1
                        const sub = it?.subtotal ?? (typeof price === 'number' ? price * qty : undefined)
                        const thumb = it?.thumbnail || it?.product?.thumbnail || '/no-image.png'
                        return (
                          <tr key={idx}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={thumb} alt={name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                <div>
                                  <div className="fw-medium">{name}</div>
                                  <div className="text-muted small">
                                    {it?.selectedColor ? <>Color: {it.selectedColor} </> : null}
                                    {it?.selectedSize ? (
                                      <>
                                        <span className="ms-2">Size: {it.selectedSize}</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{formatCurrency(price)}</td>
                            <td>{qty}</td>
                            <td className="text-end">{formatCurrency(sub)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Status History</CardTitle>
              </CardHeader>
              <CardBody>
                {(order as any).statusHistory?.length ? (
                  <ul className="list-unstyled mb-0">
                    {(order as any).statusHistory.map((h: any, i: number) => (
                      <li key={i} className="d-flex align-items-start gap-2 mb-2">
                        <IconifyIcon icon="solar:checklist-minimalistic-broken" className="text-success mt-1" />
                        <div>
                          <div className="fw-semibold text-capitalize">{h.status}</div>
                          <div className="text-muted small">
                            {new Date(h.timestamp).toLocaleString()} {h.note ? `— ${h.note}` : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">No history available.</div>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Right: Summary & Details */}
          <Col xl={3} lg={4}>
            {/* Quick Actions Card */}
            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Quick Actions</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="d-grid gap-2">
                  {/* Order Status Actions */}
                  <div>
                    <label className="form-label small text-muted mb-1">Order Status</label>
                    <Dropdown className="d-grid">
                      <Dropdown.Toggle 
                        variant="outline-primary" 
                        size="sm"
                        disabled={isUpdating}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <span>Change to: {order?.status || 'pending'}</span>
                        <IconifyIcon icon="solar:alt-arrow-down-linear" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100">
                        <Dropdown.Item onClick={() => handleStatusUpdate('pending')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:clock-circle-broken" className="me-2 text-warning" />
                            <div>
                              <div className="fw-medium">Pending</div>
                              <small className="text-muted">Order received, awaiting processing</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate('confirmed')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:check-circle-broken" className="me-2 text-info" />
                            <div>
                              <div className="fw-medium">Confirmed</div>
                              <small className="text-muted">Order confirmed and processing</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate('shipped')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:delivery-broken" className="me-2 text-primary" />
                            <div>
                              <div className="fw-medium">Shipped</div>
                              <small className="text-muted">Order shipped to customer</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate('delivered')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:box-broken" className="me-2 text-success" />
                            <div>
                              <div className="fw-medium">Delivered</div>
                              <small className="text-muted">Order successfully delivered</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleStatusUpdate('cancelled')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:close-circle-broken" className="me-2 text-danger" />
                            <div>
                              <div className="fw-medium">Cancelled</div>
                              <small className="text-muted">Order cancelled</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusUpdate('returned')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:restart-broken" className="me-2 text-secondary" />
                            <div>
                              <div className="fw-medium">Returned</div>
                              <small className="text-muted">Order returned by customer</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  {/* Payment Status Actions */}
                  <div>
                    <label className="form-label small text-muted mb-1">Payment Status</label>
                    <Dropdown className="d-grid">
                      <Dropdown.Toggle 
                        variant="outline-success" 
                        size="sm"
                        disabled={isUpdating}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <span>Change to: {order?.paymentStatus || 'pending'}</span>
                        <IconifyIcon icon="solar:alt-arrow-down-linear" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100">
                        <Dropdown.Item onClick={() => handlePaymentStatusUpdate('pending')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:clock-circle-broken" className="me-2 text-warning" />
                            <div>
                              <div className="fw-medium">Pending</div>
                              <small className="text-muted">Payment not yet received</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePaymentStatusUpdate('paid')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:card-broken" className="me-2 text-success" />
                            <div>
                              <div className="fw-medium">Paid</div>
                              <small className="text-muted">Payment successfully received</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePaymentStatusUpdate('failed')}>
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:close-circle-broken" className="me-2 text-danger" />
                            <div>
                              <div className="fw-medium">Failed</div>
                              <small className="text-muted">Payment failed or declined</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  {/* Delhivery Actions */}
                  <hr />
                  <div>
                    <label className="form-label small text-muted mb-2">Shipping via Delhivery</label>
                    <div className="d-grid gap-2">
                      {!order?.trackingNumber ? (
                        <>
                          <Button size="sm" variant="primary" disabled={isUpdating || creatingShipment} onClick={handleCreateDelhiveryShipment}>
                            {creatingShipment ? 'Creating Shipment…' : 'Create Delhivery Shipment'}
                          </Button>
                          <Button size="sm" variant="outline-primary" disabled={isUpdating || schedulingPickup} onClick={handleSchedulePickup}>
                            {schedulingPickup ? 'Scheduling Pickup…' : 'Schedule Pickup'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="small text-muted">Tracking: <strong>{order.trackingNumber}</strong></div>
                          <div className="d-grid gap-2">
                            <div className="d-flex gap-2">
                              {/* <Button size="sm" variant="outline-secondary" disabled={fetchingLabel} onClick={handleDownloadLabel} className="flex-fill">
                                <IconifyIcon icon="solar:download-broken" className="me-1" />
                                {fetchingLabel ? 'Downloading…' : 'Download Label'}
                              </Button> */}
                              <Button size="sm" variant="outline-info" disabled={fetchingTrack} onClick={handleTrack} className="flex-fill">
                                <IconifyIcon icon="solar:radar-2-broken" className="me-1" />
                                {fetchingTrack ? 'Fetching…' : 'Track Now'}
                              </Button>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              as="a" 
                              href="https://one.delhivery.com/orders/forward/ready-to-ship" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <IconifyIcon icon="solar:external-link-broken" className="me-1" />
                              View in Delhivery Dashboard
                            </Button>
                          </div>
                          {trackData && (
                            <TrackingDisplay trackingData={trackData} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {isUpdating && (
                  <div className="text-center mt-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Updating...</span>
                    </div>
                    <div className="small text-muted mt-1">Updating status...</div>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Order Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(order.subtotal)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <strong>{formatCurrency(order.shippingCost)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <strong>{formatCurrency(order.tax)}</strong>
                </div>
                {order.discount ? (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount</span>
                    <strong>-{formatCurrency(order.discount)}</strong>
                  </div>
                ) : null}
              </CardBody>
              <CardFooter className="d-flex align-items-center justify-content-between bg-light-subtle">
                <div>
                  <p className="fw-medium text-dark mb-0">Total Amount</p>
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0">{formatCurrency(order.totalAmount)}</p>
                </div>
              </CardFooter>
            </Card>

            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Payment Information</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-2">
                  Method: <strong className="text-capitalize">{order.paymentInfo?.method || '-'}</strong>
                </div>
                <div className="mb-2">
                  Status:{' '}
                  <Badge bg="light" text="dark" className="text-uppercase">
                    {/* Prefer order.paymentStatus; map paymentInfo.status 'completed' -> 'paid' as a friendly label */}
                    {(() => {
                      const s = order.paymentStatus || order.paymentInfo?.status
                      if (!s) return '-'
                      return s === 'completed' ? 'paid' : s
                    })()}
                  </Badge>
                </div>
                {order.paymentInfo?.transactionId && <div className="mb-2">Txn ID: {order.paymentInfo.transactionId}</div>}
                {order.paymentInfo?.paymentDate && <div className="mb-0">Paid On: {new Date(order.paymentInfo.paymentDate).toLocaleString()}</div>}
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardHeader>
                <CardTitle as={'h4'}>Customer Details</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-2">
                  <strong>{order.user?.name}</strong>
                </div>
                {order.user?.email && (
                  <div className="mb-1">
                    <Link href={`mailto:${order.user.email}`} className="link-primary">
                      {order.user.email}
                    </Link>
                  </div>
                )}
                {order.user?.phone && <div className="mb-3">{order.user.phone}</div>}

                <h6 className="text-muted">Shipping Address</h6>
                <AddressBlock data={order.shippingAddress as any} />
                <hr />
                <h6 className="text-muted">Billing Address</h6>
                <AddressBlock data={order.billingAddress as any} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}

function TrackingDisplay({ trackingData }: { trackingData: any }) {
  const shipment = trackingData?.ShipmentData?.[0]?.Shipment || trackingData?.Shipment || {}
  const status = shipment.Status || {}
  const scans = shipment.Scans || []
  const consignee = shipment.Consignee || {}

  const getStatusVariant = (statusCode: string) => {
    if (!statusCode) return 'secondary'
    if (statusCode.includes('DLV') || statusCode.includes('OK')) return 'success'
    if (statusCode.includes('RTO') || statusCode.includes('LOST')) return 'danger'
    if (statusCode.includes('OFD') || statusCode.includes('UD')) return 'primary'
    if (statusCode.includes('PP')) return 'info'
    return 'warning'
  }

  return (
    <Card className="mt-3 border">
      <CardHeader className="bg-light-subtle">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="mb-0">Shipment Tracking</h6>
            <small className="text-muted">AWB: {shipment.AWB}</small>
          </div>
          <Badge bg={getStatusVariant(status.StatusCode)} className="text-uppercase">
            {status.Status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        {/* Current Status */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="d-flex align-items-start gap-3">
            <div className="mt-1">
              <IconifyIcon icon="solar:box-bold-duotone" className={`fs-24 text-${getStatusVariant(status.StatusCode)}`} />
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold text-dark">{status.Status}</div>
              <div className="text-muted small">{status.Instructions || 'No additional information'}</div>
              <div className="mt-1 d-flex gap-3 flex-wrap small">
                <span>
                  <IconifyIcon icon="solar:map-point-broken" className="me-1" />
                  {status.StatusLocation || 'N/A'}
                </span>
                {status.StatusDateTime && (
                  <span>
                    <IconifyIcon icon="solar:calendar-broken" className="me-1" />
                    {new Date(status.StatusDateTime).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <Row className="g-3 mb-3">
          <Col md={6}>
            <div className="small text-muted">Order Type</div>
            <div className="fw-medium">{shipment.OrderType || 'N/A'}</div>
          </Col>
          <Col md={6}>
            <div className="small text-muted">Reference Number</div>
            <div className="fw-medium">{shipment.ReferenceNo || 'N/A'}</div>
          </Col>
          <Col md={6}>
            <div className="small text-muted">Destination</div>
            <div className="fw-medium">{shipment.Destination || 'N/A'}</div>
          </Col>
          <Col md={6}>
            <div className="small text-muted">Quantity</div>
            <div className="fw-medium">{shipment.Quantity || 'N/A'}</div>
          </Col>
          {shipment.CODAmount > 0 && (
            <Col md={6}>
              <div className="small text-muted">COD Amount</div>
              <div className="fw-medium">₹ {shipment.CODAmount?.toLocaleString()}</div>
            </Col>
          )}
          {shipment.InvoiceAmount > 0 && (
            <Col md={6}>
              <div className="small text-muted">Invoice Amount</div>
              <div className="fw-medium">₹ {shipment.InvoiceAmount?.toLocaleString()}</div>
            </Col>
          )}
        </Row>

        {/* Consignee Details */}
        {consignee.Name && (
          <div className="mb-3">
            <h6 className="text-muted mb-2">Consignee</h6>
            <div className="p-2 bg-light rounded small">
              <div className="fw-medium">{consignee.Name}</div>
              <div>{consignee.City}, {consignee.State} - {consignee.PinCode}</div>
              <div>{consignee.Country}</div>
            </div>
          </div>
        )}

        {/* Tracking Timeline */}
        {scans.length > 0 && (
          <div>
            <h6 className="text-muted mb-3">Shipment Journey</h6>
            <div className="position-relative" style={{ paddingLeft: '2rem' }}>
              {/* Timeline line */}
              <div className="position-absolute" style={{ left: '11px', top: '8px', bottom: '8px', width: '2px', background: '#dee2e6' }}></div>
              
              {scans.map((scan: any, idx: number) => {
                const detail = scan.ScanDetail || {}
                return (
                  <div key={idx} className="position-relative mb-3 pb-3">
                    {/* Timeline dot */}
                    <div className="position-absolute bg-white" style={{ left: '-1.55rem', top: '0' }}>
                      <div className={`rounded-circle bg-${getStatusVariant(detail.StatusCode)}`} style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconifyIcon icon="solar:check-circle-bold" className="text-white" style={{ fontSize: '14px' }} />
                      </div>
                    </div>
                    
                    <div className="ps-2">
                      <div className="fw-medium text-dark">{detail.Scan}</div>
                      <div className="text-muted small">{detail.Instructions}</div>
                      <div className="mt-1 small">
                        <span className="text-muted">
                          <IconifyIcon icon="solar:map-point-broken" className="me-1" />
                          {detail.ScannedLocation}
                        </span>
                        <span className="text-muted ms-3">
                          <IconifyIcon icon="solar:clock-circle-broken" className="me-1" />
                          {new Date(detail.ScanDateTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function AddressBlock({ data }: { data?: any }) {
  if (!data) return <div className="text-muted">Not provided.</div>
  return (
    <address className="mb-0">
      <div>{data.fullName}</div>
      {data.phone && <div>Phone: {data.phone}</div>}
      {data.email && <div>Email: {data.email}</div>}
      <div>
        {data.addressLine1}
        {data.addressLine2 ? `, ${data.addressLine2}` : ''}
      </div>
      <div>
        {data.city}
        {data.state ? `, ${data.state}` : ''}
        {data.postalCode ? `, ${data.postalCode}` : ''}
      </div>
      {data.country && <div>{data.country}</div>}
    </address>
  )
}
