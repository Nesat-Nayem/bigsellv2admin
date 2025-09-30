'use client'

import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Col, 
  Row, 
  Spinner, 
  Badge,
  Alert,
  Button,
  Table,
  Toast,
  ToastContainer
} from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { 
  useGetCategoryByIdQuery, 
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetChildrenByParentQuery,
  useGetCategoryBreadcrumbsQuery,
  ICategory,
  IAttribute
} from '@/store/productCategoryApi'

const ViewCategory = () => {
  const router = useRouter()
  const params = useParams()
  const categoryId = typeof params?.id === 'string' ? params.id : undefined

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const {
    data: category,
    isLoading: isFetching,
    isError,
    refetch
  } = useGetCategoryByIdQuery(categoryId!, {
    skip: !categoryId,
  })

  const {
    data: children = [],
    isLoading: loadingChildren
  } = useGetChildrenByParentQuery(categoryId!, {
    skip: !categoryId,
  })

  const {
    data: breadcrumbs = [],
    isLoading: loadingBreadcrumbs
  } = useGetCategoryBreadcrumbsQuery(categoryId!, {
    skip: !categoryId,
  })

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleCategoryStatusMutation()

  // Toast helper
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Delete handler
  const handleDelete = async () => {
    if (!categoryId || !category) return
    
    if (children.length > 0) {
      showMessage('Cannot delete category with subcategories. Delete subcategories first.', 'error')
      return
    }

    if (!window.confirm(`Are you sure you want to delete "${category.title}"? This action cannot be undone.`)) return

    try {
      await deleteCategory(categoryId).unwrap()
      showMessage('Category deleted successfully!', 'success')
      setTimeout(() => {
        router.push('/category/category-list')
      }, 2000)
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete category', 'error')
    }
  }

  // Toggle status handler
  const handleToggleStatus = async () => {
    if (!categoryId || !category) return

    try {
      await toggleStatus({ id: categoryId, isActive: !(category.isActive !== false) }).unwrap()
      showMessage(`Category ${category.isActive !== false ? 'deactivated' : 'activated'} successfully!`, 'success')
      refetch()
    } catch (error: any) {
      console.error('Toggle status failed:', error)
      showMessage(error?.data?.message || 'Failed to update category status', 'error')
    }
  }

  if (!categoryId) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-circle-broken" className="me-2" />
          Invalid category ID
        </Alert>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading category details...</p>
      </div>
    )
  }

  if (isError || !category) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">
          <IconifyIcon icon="solar:danger-circle-broken" className="me-2" />
          Failed to load category data
        </Alert>
        <Link href="/category/category-list" className="btn btn-outline-primary">
          <IconifyIcon icon="solar:arrow-left-broken" className="me-1" />
          Back to List
        </Link>
      </div>
    )
  }

  return (
    <>
      <Row>
        <Col lg={12}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="mb-1">Category Details</h4>
              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link href="/category/category-list">Categories</Link>
                    </li>
                    {breadcrumbs.slice(0, -1).map((crumb, index) => (
                      <li key={crumb._id} className="breadcrumb-item">
                        <Link href={`/category/category-view/${crumb._id}`}>
                          {crumb.title}
                        </Link>
                      </li>
                    ))}
                    <li className="breadcrumb-item active" aria-current="page">
                      {category.title}
                    </li>
                  </ol>
                </nav>
              )}
            </div>
            <div className="d-flex gap-2">
              <Link href="/category/category-list" className="btn btn-outline-secondary">
                <IconifyIcon icon="solar:arrow-left-broken" className="me-1" />
                Back to List
              </Link>
              <Link 
                href={`/category/category-edit/${categoryId}`} 
                className="btn btn-primary"
              >
                <IconifyIcon icon="solar:pen-2-broken" className="me-1" />
                Edit Category
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Basic Information</CardTitle>
              <div className="d-flex gap-2">
                <Badge bg={category.isActive !== false ? 'success' : 'danger'}>
                  {category.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
                <Badge bg="info">Level {category.level || 0}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Title</label>
                    <p className="fw-medium">{category.title}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Slug</label>
                    <p className="text-monospace">{category.slug || 'Auto-generated'}</p>
                  </div>
                </Col>
              </Row>

              {category.description && (
                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label className="form-label text-muted">Description</label>
                      <p>{category.description}</p>
                    </div>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Display Order</label>
                    <p>{category.displayOrder || 0}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Parent Category</label>
                    <p>{category.parentId ? 'Sub Category' : 'Root Category'}</p>
                  </div>
                </Col>
              </Row>

              {category.icon && (
                <Row>
                  <Col md={12}>
                    <div className="mb-3">
                      <label className="form-label text-muted">Icon</label>
                      <p>
                        <IconifyIcon icon={category.icon} className="me-2" />
                        <code>{category.icon}</code>
                      </p>
                    </div>
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>

          {/* Category Attributes */}
          {category.attributes && category.attributes.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">Category Attributes ({category.attributes.length})</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.attributes.map((attr: IAttribute, index: number) => (
                        <tr key={index}>
                          <td className="fw-medium">{attr.name}</td>
                          <td>
                            <Badge bg="secondary">{attr.type}</Badge>
                          </td>
                          <td>
                            <Badge bg={attr.required ? 'danger' : 'success'}>
                              {attr.required ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td>
                            {attr.options && attr.options.length > 0 
                              ? attr.options.join(', ') 
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* SEO Information */}
          {(category.seoTitle || category.seoDescription || (category.seoKeywords && category.seoKeywords.length > 0)) && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">SEO Information</CardTitle>
              </CardHeader>
              <CardBody>
                {category.seoTitle && (
                  <Row>
                    <Col lg={12}>
                      <div className="mb-3">
                        <label className="form-label text-muted">SEO Title</label>
                        <p>{category.seoTitle}</p>
                      </div>
                    </Col>
                  </Row>
                )}

                {category.seoDescription && (
                  <Row>
                    <Col lg={12}>
                      <div className="mb-3">
                        <label className="form-label text-muted">SEO Description</label>
                        <p>{category.seoDescription}</p>
                      </div>
                    </Col>
                  </Row>
                )}

                {category.seoKeywords && category.seoKeywords.length > 0 && (
                  <Row>
                    <Col lg={12}>
                      <div className="mb-3">
                        <label className="form-label text-muted">SEO Keywords</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {category.seoKeywords.map((keyword) => (
                            <Badge key={keyword} bg="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          )}

          {/* Subcategories */}
          {children.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">Subcategories ({children.length})</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {children.map((child: ICategory) => (
                        <tr key={child._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {child.icon && (
                                <IconifyIcon icon={child.icon} className="text-muted" />
                              )}
                              <div>
                                <p className="mb-0 fw-medium">{child.title}</p>
                                <small className="text-muted">{child.description}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={child.isActive !== false ? 'success' : 'danger'}>
                              {child.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>{child.displayOrder || 0}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link
                                href={`/category/category-view/${child._id}`}
                                className="btn btn-soft-info btn-sm"
                              >
                                <IconifyIcon icon="solar:eye-broken" />
                              </Link>
                              <Link
                                href={`/category/category-edit/${child._id}`}
                                className="btn btn-soft-primary btn-sm"
                              >
                                <IconifyIcon icon="solar:pen-2-broken" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Category Image */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5">Category Image</CardTitle>
            </CardHeader>
            <CardBody className="text-center">
              {category.image && typeof category.image === 'string' ? (
                <Image
                  src={category.image}
                  alt={category.title}
                  width={250}
                  height={250}
                  className="rounded border"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded border bg-light d-flex align-items-center justify-content-center" style={{ width: 250, height: 250, margin: '0 auto' }}>
                  <IconifyIcon 
                    icon={category.icon || 'solar:folder-broken'} 
                    className="fs-48 text-muted" 
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Category Statistics */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5">Category Info</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">ID:</span>
                  <code className="small">{category._id}</code>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Subcategories:</span>
                  <Badge bg="info">{children.length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Level:</span>
                  <Badge bg="secondary">{category.level || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Created:</span>
                  <small>{category.createdAt ? String(category.createdAt) : 'N/A'}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Updated:</span>
                  <small>{category.updatedAt ? String(category.updatedAt) : 'N/A'}</small>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle as="h5">Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                <Button
                  variant={category.isActive !== false ? 'warning' : 'success'}
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                >
                  <IconifyIcon 
                    icon={category.isActive !== false ? 'solar:pause-broken' : 'solar:play-broken'} 
                    className="me-1" 
                  />
                  {category.isActive !== false ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Link 
                  href={`/category/category-edit/${categoryId}`} 
                  className="btn btn-primary"
                >
                  <IconifyIcon icon="solar:pen-2-broken" className="me-1" />
                  Edit Category
                </Link>
                
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting || children.length > 0}
                  title={children.length > 0 ? 'Cannot delete category with subcategories' : ''}
                >
                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-1" />
                  {isDeleting ? 'Deleting...' : 'Delete Category'}
                </Button>
                
                {children.length > 0 && (
                  <small className="text-muted text-center">
                    Delete all subcategories first before deleting this category
                  </small>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant === 'success' ? 'success' : 'danger'}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default ViewCategory
