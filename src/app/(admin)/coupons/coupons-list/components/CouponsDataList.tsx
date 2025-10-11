"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetCouponsQuery, useDeleteCouponMutation } from '@/store/couponApi'

const CouponsDataList = () => {
  const { data: coupons = [], isLoading } = useGetCouponsQuery()
  const [deleteCoupon] = useDeleteCouponMutation()

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as={'h4'} className="flex-grow-1">
              Coupon List
            </CardTitle>
            {/* 🔍 Search */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <input type="text" placeholder="Search..." className="form-control form-control-sm" style={{ maxWidth: 200 }} />
            </div>
            <Link href="/coupons/coupons-add" className="btn btn-sm btn-primary">
              + Add Coupon
            </Link>
          </CardHeader>

          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="alert alert-info m-0">Loading...</div>
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="text-muted">No coupons found.</div>
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c: any) => (
                      <tr key={c._id}>
                        <td>{c.code}</td>
                        <td>
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}%`
                            : `Rs.${Number(c.discountValue || 0).toFixed(2)}`}
                        </td>
                        <td>{String(c.startDate)}</td>
                        <td>{String(c.endDate)}</td>
                        <td>
                          <span className={`badge ${c.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/coupons/coupons-edit?id=${c._id}`} className="btn btn-soft-primary btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              onClick={async () => {
                                try { await deleteCoupon(c._id as string).unwrap() } catch {}
                              }}
                              className="btn btn-soft-danger btn-sm"
                            >
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
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-end mb-0">
                <li className="page-item">
                  <Link className="page-link" href="">
                    Previous
                  </Link>
                </li>
                <li className="page-item active">
                  <Link className="page-link" href="">
                    1
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    2
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    3
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    Next
                  </Link>
                </li>
              </ul>
            </nav>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default CouponsDataList
