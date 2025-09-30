'use client'

import React, { useState } from 'react'
import { Button, Dropdown, Modal, Form, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { 
  useBulkDeleteCategoriesMutation,
  useReorderCategoriesMutation 
} from '@/store/productCategoryApi'

interface CategoryBulkActionsProps {
  selectedCategories: string[]
  onClearSelection: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const CategoryBulkActions: React.FC<CategoryBulkActionsProps> = ({
  selectedCategories,
  onClearSelection,
  onSuccess,
  onError
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderData, setReorderData] = useState<Array<{ id: string; displayOrder: number }>>([])

  const [bulkDeleteCategories, { isLoading: isDeleting }] = useBulkDeleteCategoriesMutation()
  const [reorderCategories, { isLoading: isReordering }] = useReorderCategoriesMutation()

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteCategories(selectedCategories).unwrap()
      onSuccess(`Successfully deleted ${result.deletedCount} categories`)
      setShowDeleteModal(false)
      onClearSelection()
    } catch (error: any) {
      onError(error?.data?.message || 'Failed to delete categories')
    }
  }

  const handleBulkReorder = async () => {
    if (reorderData.length === 0) {
      onError('Please set display order for categories')
      return
    }

    try {
      await reorderCategories(reorderData).unwrap()
      onSuccess('Categories reordered successfully')
      setShowReorderModal(false)
      onClearSelection()
    } catch (error: any) {
      onError(error?.data?.message || 'Failed to reorder categories')
    }
  }

  const initReorderData = () => {
    const data = selectedCategories.map((id, index) => ({
      id,
      displayOrder: index + 1
    }))
    setReorderData(data)
    setShowReorderModal(true)
  }

  if (selectedCategories.length === 0) {
    return null
  }

  return (
    <>
      <div className="d-flex align-items-center gap-2 bg-light p-3 rounded mb-3">
        <div className="flex-grow-1">
          <strong>{selectedCategories.length}</strong> categories selected
        </div>
        
        <Dropdown>
          <Dropdown.Toggle variant="primary" size="sm">
            <IconifyIcon icon="solar:settings-broken" className="me-1" />
            Bulk Actions
          </Dropdown.Toggle>
          
          <Dropdown.Menu>
            <Dropdown.Item onClick={initReorderData}>
              <IconifyIcon icon="solar:sort-broken" className="me-2" />
              Reorder Categories
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={() => setShowDeleteModal(true)}
              className="text-danger"
            >
              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-2" />
              Delete Selected
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={onClearSelection}
        >
          <IconifyIcon icon="solar:close-circle-broken" className="me-1" />
          Clear Selection
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="solar:danger-triangle-broken" className="text-danger me-2" />
            Confirm Bulk Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <IconifyIcon icon="solar:info-circle-broken" className="me-2" />
            This action cannot be undone!
          </Alert>
          <p>
            Are you sure you want to delete <strong>{selectedCategories.length}</strong> selected categories?
          </p>
          <p className="text-muted small">
            Categories with subcategories cannot be deleted and will be skipped.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <IconifyIcon icon="solar:refresh-broken" className="me-1 spin" />
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="me-1" />
                Delete Categories
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reorder Modal */}
      <Modal show={showReorderModal} onHide={() => setShowReorderModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="solar:sort-broken" className="me-2" />
            Reorder Categories
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Set the display order for the selected categories. Lower numbers will appear first.
          </p>
          
          <div className="space-y-3">
            {reorderData.map((item, index) => (
              <div key={item.id} className="d-flex align-items-center gap-3 p-2 border rounded">
                <div className="flex-grow-1">
                  <strong>Category ID:</strong> <code>{item.id}</code>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0">Display Order:</label>
                  <Form.Control
                    type="number"
                    size="sm"
                    style={{ width: '100px' }}
                    value={item.displayOrder}
                    onChange={(e) => {
                      const newOrder = parseInt(e.target.value) || 0
                      setReorderData(prev => 
                        prev.map(d => 
                          d.id === item.id 
                            ? { ...d, displayOrder: newOrder }
                            : d
                        )
                      )
                    }}
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowReorderModal(false)}
            disabled={isReordering}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkReorder}
            disabled={isReordering}
          >
            {isReordering ? (
              <>
                <IconifyIcon icon="solar:refresh-broken" className="me-1 spin" />
                Reordering...
              </>
            ) : (
              <>
                <IconifyIcon icon="solar:check-circle-broken" className="me-1" />
                Apply Reorder
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .space-y-3 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </>
  )
}

export default CategoryBulkActions
