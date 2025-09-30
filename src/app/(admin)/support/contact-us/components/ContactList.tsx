'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteContactEnquiryMutation, useGetContactEnquiriesQuery } from '@/store/contactEnquiryApi'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { Card, CardBody, CardFooter, Spinner, Toast, ToastContainer } from 'react-bootstrap'

const ContactList = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: contactEnquiries = [], isLoading, isError } = useGetContactEnquiriesQuery()
  const [deleteEnquiry, { isLoading: isDeleting }] = useDeleteContactEnquiryMutation()

  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  //   Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  //   Delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteEnquiry(id).unwrap()
      showMessage('Enquiry deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Enquiry', 'error')
    }
  }
  //   Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(contactEnquiries.length / itemsPerPage) || 1

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return contactEnquiries.slice(startIndex, startIndex + itemsPerPage)
  }, [contactEnquiries, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  if (isLoading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger text-center py-4">Failed to load contact enquiries</div>

  return (
    <>
      <Card>
        <CardBody>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th> Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>{item.subject}</td>
                      <td>{item.message}</td>
                      <td>
                        <button type="button" className="btn btn-soft-danger btn-sm" disabled={isDeleting} onClick={() => handleDelete(item._id)}>
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {contactEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No enquiries found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
        {/*   Pagination */}
        <CardFooter className="border-top">
          <nav>
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

export default ContactList
