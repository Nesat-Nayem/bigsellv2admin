'use client'

import ComponentContainerCard from '@/components/ComponentContainerCard'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteSellerMutation, useGetSellersQuery } from '@/store/sellerApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'

const SeelerList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const limit = 10
  const { data, isLoading, isError } = useGetSellersQuery({ search: searchTerm || undefined, page: currentPage, limit })
  const [deleteSeller, { isLoading: isDeleting }] = useDeleteSellerMutation()

  const items = data?.items || []
  const totalPages = data?.totalPages || 1

  //   page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  //   Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  //   Delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteSeller(id).unwrap()
      showMessage('Vendor deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete vendor', 'error')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Vendor List
          </CardTitle>
          {/* 🔍 Search */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // reset to page 1 when searching
              }}
              className="form-control form-control-sm"
              style={{ maxWidth: 200 }}
            />
          </div>
        </CardHeader>
        <CardBody>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ textWrap: 'nowrap' }}>Full Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Email</th>
                    <th style={{ textWrap: 'nowrap' }}>Phone</th>
                    <th style={{ textWrap: 'nowrap' }}>GST No.</th>
                    <th style={{ textWrap: 'nowrap' }}>Business Address</th>
                    <th style={{ textWrap: 'nowrap' }}>Plan Purchased</th>
                    <th style={{ textWrap: 'nowrap' }}>Paymeny Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Paymeny Amount</th>
                    <th style={{ textWrap: 'nowrap' }}>Aadhar Card</th>
                    <th style={{ textWrap: 'nowrap' }}>Pan Card</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={10} className="text-center">Loading...</td>
                    </tr>
                  )}
                  {!isLoading && items.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center">No data found</td>
                    </tr>
                  )}
                  {!isLoading && items.map((v: any) => (
                    <tr key={v._id}>
                      <td style={{ textWrap: 'nowrap' }}>{v.vendorName}</td>
                      <td style={{ textWrap: 'nowrap' }}>{v.email}</td>
                      <td style={{ textWrap: 'nowrap' }}>{v.phone}</td>
                      <td style={{ textWrap: 'nowrap' }}>{v.gstNo || '-'}</td>
                      <td style={{ textWrap: 'nowrap' }}>{v.address}</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className={`badge bg-info`}>{v.planName || '-'}</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className={`badge ${v.paymentStatus === 'done' ? 'bg-success' : v.paymentStatus === 'failed' ? 'bg-danger' : 'bg-secondary'}`}>{v.paymentStatus || 'pending'}</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>{v.paymentAmount ? `Rs.${v.paymentAmount}` : '-'}</td>
                      <td>
                        {v.aadharUrl ? (
                          <Image src={v.aadharUrl} alt="Aadhar Card" width={100} height={100} className="img-fluid" />
                        ) : (
                          '-' 
                        )}
                      </td>
                      <td>
                        {v.panUrl ? (
                          <Image src={v.panUrl} alt="Pan Card" width={100} height={100} className="img-fluid" />
                        ) : (
                          '-' 
                        )}
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <span className={`badge ${v.kycStatus === 'approved' ? 'bg-success' : v.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{v.kycStatus}</span>
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        <div className="d-flex gap-2">
                          <Link href={`/seller/seller-edit?id=${v._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button onClick={() => handleDelete(v._id)} className="btn btn-soft-danger btn-sm" disabled={isDeleting}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
        {/*   Pagination */}
        <CardFooter className="border-top">
          <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </CardFooter>
      </Card>

      {/*   Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default SeelerList
