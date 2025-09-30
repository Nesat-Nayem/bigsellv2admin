'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeletemainBannerMutation, useGetmainBannersQuery } from '@/store/mainBannerApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'

const HomeBanner = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: mainBanners = [], isLoading, isError } = useGetmainBannersQuery()
  console.log(mainBanners)
  const [deleteMainBanner, { isLoading: isDeleting }] = useDeletemainBannerMutation()

  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  //   Delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteMainBanner(id).unwrap()
      showMessage('Banner deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete banner', 'error')
    }
  }

  //   Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(mainBanners.length / itemsPerPage) || 1

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return mainBanners.slice(startIndex, startIndex + itemsPerPage)
  }, [mainBanners, currentPage])

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
  if (isError) return <div className="text-danger text-center py-4">Failed to load</div>

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Home Banner List
          </CardTitle>
          <Link href="/pages/banner-add" className="btn btn-sm btn-primary">
            + Add Banner
          </Link>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered table-bordered">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Banner</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.map((banner) => (
                  <tr key={banner._id}>
                    <td>
                      {banner?.image ? (
                        <Image width={50} height={50} src={banner.image as string} alt="banner" className="avatar avatar-sm rounded" />
                      ) : (
                        <Image width={50} height={50} src="https://via.placeholder.com/50x50" alt="banner" className="avatar avatar-sm rounded" />
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(banner._id)} disabled={isDeleting}>
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default HomeBanner
