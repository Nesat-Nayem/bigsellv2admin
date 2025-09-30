'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteBlogCategoryMutation, useGetBlogCategoriesQuery } from '@/store/blogCategoryApi'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'

const BlogCategory = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: blogCategories = [], isLoading, isError } = useGetBlogCategoriesQuery()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteBlogCategoryMutation()

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
      await deleteCategory(id).unwrap()
      showMessage('Blog Category deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Blog Category', 'error')
    }
  }
  //   Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(blogCategories.length / itemsPerPage) || 1

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return blogCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [blogCategories, currentPage])

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
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Blog Category List
          </CardTitle>
          <Link href="/blog/blog-category-add" className="btn btn-sm btn-primary">
            + Add Category
          </Link>
        </CardHeader>
        <CardBody>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Category Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems?.map((category) => (
                    <tr key={category._id}>
                      <td>{category.categoryName}</td>
                      <td className="text-success">
                        <span className={`badge badge-soft-${category.status === 'Active' ? 'success' : 'danger'}`}>{category.status}</span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/blog/blog-category-edit/${category._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href="" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(category._id)}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Link>
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
      </Card>{' '}
      {/*   Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default BlogCategory
