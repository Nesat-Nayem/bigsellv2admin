'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Badge, Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer, Button } from 'react-bootstrap'
import {
  useSearchCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useBulkDeleteCategoriesMutation,
  ICategory,
} from '@/store/productCategoryApi'

const CategoryList = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [levelFilter, setLevelFilter] = useState<string>('')

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useSearchCategoriesQuery({
    query: search || undefined,
    page,
    limit,
    status: statusFilter,
    level: levelFilter ? Number(levelFilter) : undefined,
  })
  const categories = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || Math.ceil(categories.length / limit) || 1

  // Debug logging
  React.useEffect(() => {
    console.log('CategoryList Debug:', {
      categories,
      isLoading,
      isError,
      error,
      page,
      limit,
      search,
      statusFilter,
      levelFilter,
      total,
      totalPages,
    })
  }, [categories, isLoading, isError, error, page, limit, search, statusFilter, levelFilter, total, totalPages])
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleCategoryStatusMutation()
  const [bulkDeleteCategories, { isLoading: isBulkDeleting }] = useBulkDeleteCategoriesMutation()

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteCategory(id).unwrap()
      showMessage('Category deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete category', 'error')
    }
  }

  // Toggle status handler
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentStatus }).unwrap()
      showMessage(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success')
    } catch (error: any) {
      console.error('Toggle status failed:', error)
      showMessage(error?.data?.message || 'Failed to update category status', 'error')
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map((cat) => cat._id))
    } else {
      setSelectedCategories([])
    }
  }

  // Handle individual selection
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId])
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
    }
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      showMessage('Please select categories to delete', 'error')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) return

    try {
      await bulkDeleteCategories(selectedCategories).unwrap()
      setSelectedCategories([])
      showMessage('Categories deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Bulk delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete categories', 'error')
    }
  }

  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1) // Reset to first page on search
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading categories...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-danger text-center py-4">
        <p>Failed to load categories</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1 flex-wrap">
              <CardTitle as={'h4'} className="flex-grow-1">
                Product Categories ({total})
              </CardTitle>
              <div className="d-flex gap-2 align-items-center">
                {selectedCategories.length > 0 && (
                  <Button variant="outline-danger" size="sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                    <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-1" />
                    Delete Selected ({selectedCategories.length})
                  </Button>
                )}
                <Link href="/category/category-add" className="btn btn-sm btn-primary">
                  <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                  Add Category
                </Link>
              </div>
            </CardHeader>

            {/* Search and Filter */}
            <div className="card-body border-bottom">
              <Row className="g-2">
                <Col md={6}>
                  <div className="position-relative">
                    <input type="text" className="form-control" placeholder="Search categories..." value={search} onChange={handleSearch} />
                    <IconifyIcon icon="solar:magnifer-broken" className="position-absolute top-50 end-0 translate-middle-y me-3" />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-2 justify-content-md-end">
                    <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }} style={{ width: 'auto' }}>
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select className="form-select" value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }} style={{ width: 'auto' }}>
                      <option value="">All Levels</option>
                      <option value="0">Level 0</option>
                      <option value="1">Level 1</option>
                      <option value="2">Level 2</option>
                      <option value="3">Level 3</option>
                      <option value="4">Level 4</option>
                      <option value="5">Level 5</option>
                    </select>
                    <select className="form-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ width: 'auto' }}>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="customCheck1"
                          checked={selectedCategories.length === categories.length && categories.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Parent</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        {search ? 'No categories found matching your search' : 'No categories found'}
                      </td>
                    </tr>
                  ) : (
                    categories.map((category: ICategory) => (
                      <tr key={category._id}>
                        <td>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`check-${category._id}`}
                              checked={selectedCategories.includes(category._id)}
                              onChange={(e) => handleSelectCategory(category._id, e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor={`check-${category._id}`} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              {category.image && typeof category.image === 'string' ? (
                                <Image
                                  src={category.image}
                                  alt="category"
                                  className="avatar-md rounded"
                                  width={48}
                                  height={48}
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <IconifyIcon icon={category.icon || 'solar:folder-broken'} className="fs-20 text-muted" />
                              )}
                            </div>
                            <div>
                              <p className="text-dark fw-medium fs-15 mb-0">{category.title}</p>
                              <small className="text-muted">{category.slug}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted" title={category.description}>
                            {category.description
                              ? category.description.length > 50
                                ? `${category.description.substring(0, 50)}...`
                                : category.description
                              : '-'}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">{category.parentId ? 'Sub Category' : 'Root Category'}</span>
                        </td>
                        <td>
                          <Badge bg="info">Level {category.level || 0}</Badge>
                        </td>
                        <td>
                          <Badge
                            bg={category.isActive !== false ? 'success' : 'danger'}
                            role="button"
                            onClick={() => handleToggleStatus(category._id, category.isActive !== false)}
                            style={{ cursor: 'pointer' }}>
                            {category.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">{category.createdAt ? String(category.createdAt) : '-'}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link href={`/category/category-view/${category._id}`} className="btn btn-soft-info btn-sm" title="View Details">
                              <IconifyIcon icon="solar:eye-broken" className="align-middle fs-16" />
                            </Link>
                            <Link href={`/category/category-edit/${category._id}`} className="btn btn-soft-primary btn-sm" title="Edit Category">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-16" />
                            </Link>
                            <button
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(category._id)}
                              disabled={isDeleting}
                              title="Delete Category">
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-16" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">Page {page} of {totalPages} • Total {total} categories</div>
                <nav aria-label="Category pagination">
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      // window of pages around current page
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const pageNum = start + index
                      return (
                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}
                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default CategoryList
