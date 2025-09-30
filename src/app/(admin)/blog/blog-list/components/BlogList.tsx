'use client'

import ComponentContainerCard from '@/components/ComponentContainerCard'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteBlogMutation, useGetBlogsQuery } from '@/store/blogApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'

const BlogList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: blogData = [], isLoading, isError } = useGetBlogsQuery()

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading movies</div>

  //   filter eventsData by title + category
  const filteredBlog = blogData.filter((blog: any) => [blog.title, blog.category].join(' ').toLowerCase().includes(searchTerm.toLowerCase()))

  //   pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredBlog.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredBlog.slice(startIndex, startIndex + itemsPerPage)

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
      await deleteBlog(id).unwrap()
      showMessage('Blog deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Blog', 'error')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Blog List
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
          <Link href="/blog/create-blog" className="btn btn-sm btn-primary">
            + Add Blog
          </Link>
        </CardHeader>
        <CardBody>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ textWrap: 'nowrap' }}>Image</th>
                    <th style={{ textWrap: 'nowrap' }}>Title</th>
                    <th style={{ textWrap: 'nowrap' }}>Category Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Short Desc</th>
                    <th style={{ textWrap: 'nowrap' }}>Long Desc</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((blog: any) => (
                    <tr key={blog._id}>
                      <td>
                        {
                          //   image
                          blog.image ? (
                            <Image src={blog.image} alt="blog-1" width={50} height={50} className="rounded" />
                          ) : (
                            <Image src="/images/blog/blog-1.jpg" alt="blog-1" width={50} height={50} className="rounded" />
                          )
                        }
                      </td>
                      <td>{blog.title}</td>
                      <td>{blog.category}</td>
                      <td>{blog.shortDesc.slice(0, 50)}...</td>
                      <td>{blog.longDesc.slice(0, 50)}...</td>
                      <td className="text-success">
                        <span className={`badge badge-soft-${blog.status === 'Active' ? 'success' : 'danger'}`}>{blog.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/blog/edit-blog/${blog._id}`} className="btn btn-soft-primary btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href="" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(blog._id)}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {
                    //   no data
                    currentItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No data found
                        </td>
                      </tr>
                    )
                  }
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

export default BlogList
