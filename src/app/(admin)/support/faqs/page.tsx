'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Toast, ToastContainer } from 'react-bootstrap'

import PageTItle from '@/components/PageTItle'
import Link from 'next/link'
import { useDeleteFaqMutation, useGetFaqsQuery } from '@/store/faqApi'
import { useState } from 'react'

const FaqsPage = () => {
  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)

  const { data: faqData = [], isLoading, isError } = useGetFaqsQuery({})
  const [deleteFaq, { isLoading: isDeleteLoading }] = useDeleteFaqMutation()

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading FAQs...</p>

  //   Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  //   Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    try {
      await deleteFaq(id).unwrap()
      showMessage('FAQ deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete FAQ', 'error')
    }
  }

  //   Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(faqData.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = faqData.slice(startIndex, startIndex + itemsPerPage)

  //   Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <PageTItle title="FAQS" />
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All FAQ List
          </CardTitle>
          <Link href="/support/faqs/faq-add" className="btn btn-sm btn-primary">
            + Add FAQ
          </Link>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered table-bordered">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((faq: any) => (
                    <tr key={faq._id}>
                      <td>{faq.question}</td>
                      <td>{faq.answer}</td>
                      <td>
                        <span className={`badge ${faq.isActive ? 'bg-success' : 'bg-danger'}`}>{faq.isActive ? 'active' : 'Inactive'}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/support/faqs/faq-edit/${faq._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            type="button"
                            className="btn btn-soft-danger btn-sm"
                            disabled={isDeleteLoading}
                            onClick={() => handleDelete(faq._id)}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No FAQs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

export default FaqsPage
