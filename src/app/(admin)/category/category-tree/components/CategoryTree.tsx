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
  Button,
  Toast,
  ToastContainer,
  Collapse
} from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { 
  useGetCategoryTreeQuery,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  ICategory
} from '@/store/productCategoryApi'

interface CategoryNodeProps {
  category: ICategory
  level: number
  onDelete: (id: string) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
}

const CategoryNode: React.FC<CategoryNodeProps> = ({ category, level, onDelete, onToggleStatus }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = category.children && category.children.length > 0

  const indentStyle = {
    marginLeft: `${level * 20}px`
  }

  return (
    <div className="category-node">
      <div 
        className={`d-flex align-items-center p-3 border-bottom ${level === 0 ? 'bg-light-subtle' : ''}`}
        style={indentStyle}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2 text-muted"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <IconifyIcon 
              icon={isExpanded ? 'solar:chevron-down-broken' : 'solar:chevron-right-broken'} 
              className="fs-16"
            />
          </Button>
        )}
        
        {/* Category Icon/Image */}
        <div className="me-3">
          {category.image && typeof category.image === 'string' ? (
            <Image
              src={category.image}
              alt={category.title}
              width={32}
              height={32}
              className="rounded"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <IconifyIcon 
                icon={category.icon || 'solar:folder-broken'} 
                className="fs-16 text-muted" 
              />
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <h6 className="mb-0 fw-medium">{category.title}</h6>
            <Badge bg="info" className="small">Level {category.level || 0}</Badge>
            <Badge bg={category.isActive !== false ? 'success' : 'danger'} className="small">
              {category.isActive !== false ? 'Active' : 'Inactive'}
            </Badge>
            {hasChildren && (
              <Badge bg="secondary" className="small">
                {category.children!.length} {category.children!.length === 1 ? 'child' : 'children'}
              </Badge>
            )}
          </div>
          {category.description && (
            <p className="text-muted small mb-0">
              {category.description.length > 100 
                ? `${category.description.substring(0, 100)}...`
                : category.description
              }
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-1">
          <Link
            href={`/category/category-view/${category._id}`}
            className="btn btn-soft-info btn-sm"
            title="View Details"
          >
            <IconifyIcon icon="solar:eye-broken" className="fs-14" />
          </Link>
          <Link
            href={`/category/category-edit/${category._id}`}
            className="btn btn-soft-primary btn-sm"
            title="Edit Category"
          >
            <IconifyIcon icon="solar:pen-2-broken" className="fs-14" />
          </Link>
          <Button
            variant="soft-warning"
            size="sm"
            onClick={() => onToggleStatus(category._id, category.isActive !== false)}
            title={category.isActive !== false ? 'Deactivate' : 'Activate'}
          >
            <IconifyIcon 
              icon={category.isActive !== false ? 'solar:pause-broken' : 'solar:play-broken'} 
              className="fs-14" 
            />
          </Button>
          <Button
            variant="soft-danger"
            size="sm"
            onClick={() => onDelete(category._id)}
            title="Delete Category"
            disabled={hasChildren}
          >
            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="fs-14" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <Collapse in={isExpanded}>
          <div>
            {category.children!.map((child) => (
              <CategoryNode
                key={child._id}
                category={child}
                level={level + 1}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  )
}

const CategoryTree = () => {
  const [maxDepth, setMaxDepth] = useState(3)
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: categories = [], isLoading, isError, refetch } = useGetCategoryTreeQuery({ maxDepth })
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleCategoryStatusMutation()

  // Toast helper
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
      refetch()
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
      refetch()
    } catch (error: any) {
      console.error('Toggle status failed:', error)
      showMessage(error?.data?.message || 'Failed to update category status', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading category tree...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-5">
        <div className="text-danger">Failed to load category tree</div>
        <Button variant="outline-primary" onClick={() => refetch()} className="mt-2">
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
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <CardTitle as={'h4'} className="mb-1">
                  Category Tree View
                </CardTitle>
                <p className="text-muted mb-0">Hierarchical view of all categories</p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0">Max Depth:</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={maxDepth} 
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    style={{ width: 'auto' }}
                  >
                    <option value={1}>1 Level</option>
                    <option value={2}>2 Levels</option>
                    <option value={3}>3 Levels</option>
                    <option value={4}>4 Levels</option>
                    <option value={5}>All Levels</option>
                  </select>
                </div>
                <Link href="/category/category-add" className="btn btn-sm btn-primary">
                  <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                  Add Category
                </Link>
                <Link href="/category/category-list" className="btn btn-sm btn-outline-secondary">
                  <IconifyIcon icon="solar:list-broken" className="me-1" />
                  List View
                </Link>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {categories.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3">
                    <IconifyIcon icon="solar:folder-broken" className="fs-48" />
                  </div>
                  <h5>No Categories Found</h5>
                  <p className="text-muted">Start by creating your first category</p>
                  <Link href="/category/category-add" className="btn btn-primary">
                    <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                    Add First Category
                  </Link>
                </div>
              ) : (
                <div className="category-tree">
                  {categories.map((category: ICategory) => (
                    <CategoryNode
                      key={category._id}
                      category={category}
                      level={0}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              )}
            </CardBody>

            {categories.length > 0 && (
              <div className="card-footer border-top bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    Total Categories: {categories.reduce((count, cat) => {
                      const countChildren = (category: ICategory): number => {
                        let count = 1
                        if (category.children) {
                          category.children.forEach(child => {
                            count += countChildren(child)
                          })
                        }
                        return count
                      }
                      return count + countChildren(cat)
                    }, 0)}
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => refetch()}>
                      <IconifyIcon icon="solar:refresh-broken" className="me-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

      <style jsx>{`
        .category-node .btn-soft-info {
          background-color: rgba(13, 202, 240, 0.1);
          color: #0dcaf0;
          border-color: transparent;
        }
        
        .category-node .btn-soft-primary {
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          border-color: transparent;
        }
        
        .category-node .btn-soft-warning {
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
          border-color: transparent;
        }
        
        .category-node .btn-soft-danger {
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border-color: transparent;
        }
        
        .category-node:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
      `}</style>
    </>
  )
}

export default CategoryTree
