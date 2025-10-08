'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Button, Card, Col, Form, Modal, Row, Spinner, Table, Toast, ToastContainer } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  ICategory,
} from '@/store/categoryApi'
import {
  useGetRootCategoriesQuery as useGetProductRootCategoriesQuery,
  useGetChildrenByParentQuery as useGetProductChildrenByParentQuery,
  ICategory as IProductCategory,
} from '@/store/productCategoryApi'

const HomeCategories: React.FC = () => {
  // Queries & Mutations
  const { data: categories = [], isLoading, isError, refetch, error } = useGetCategoriesQuery()
  const notFound = (error as any)?.status === 404
  const categoriesList: ICategory[] = isError && notFound ? [] : (categories || [])
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

  // Local UI state
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selected, setSelected] = useState<ICategory | null>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pcategoryId, setPcategoryId] = useState<string>('')
  const [psubcategoryId, setPsubcategoryId] = useState<string>('')
  const [psubSubcategoryId, setPsubSubcategoryId] = useState<string>('')

  // Toast state
  const [toast, setToast] = useState<{ msg: string; bg: 'success' | 'danger' } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Product Category sources
  const { data: rootProductCategories = [] } = useGetProductRootCategoriesQuery()
  const { data: childProductCategories = [], isLoading: loadingSubcats } = useGetProductChildrenByParentQuery(
    pcategoryId,
    { skip: !pcategoryId }
  )
  const { data: subSubProductCategories = [], isLoading: loadingSubSubcats } = useGetProductChildrenByParentQuery(
    psubcategoryId,
    { skip: !psubcategoryId }
  )

  const handleOpenCreate = () => {
    setTitle('')
    setFile(null)
    setPcategoryId('')
    setPsubcategoryId('')
    setPsubSubcategoryId('')
    setShowCreate(true)
  }

  const handleOpenEdit = (cat: ICategory) => {
    setSelected(cat)
    setTitle(cat.title)
    setFile(null)
    setPcategoryId((cat as any).productCategory || '')
    setPsubcategoryId((cat as any).productSubcategory || '')
    setPsubSubcategoryId((cat as any).productSubSubcategory || '')
    setShowEdit(true)
  }

  const resetModals = () => {
    setShowCreate(false)
    setShowEdit(false)
    setSelected(null)
    setTitle('')
    setFile(null)
  }

  // Create
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setToast({ msg: 'Title is required', bg: 'danger' })
      return
    }
    if (!file) {
      setToast({ msg: 'Please select an image', bg: 'danger' })
      return
    }
    if (!pcategoryId) {
      setToast({ msg: 'Product Category is required', bg: 'danger' })
      return
    }

    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('image', file)
      form.append('productCategory', pcategoryId)
      if (psubcategoryId) form.append('productSubcategory', psubcategoryId)
      if (psubSubcategoryId) form.append('productSubSubcategory', psubSubcategoryId)
      await createCategory(form).unwrap()
      setToast({ msg: 'Category created', bg: 'success' })
      resetModals()
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || 'Failed to create'
      setToast({ msg, bg: 'danger' })
    }
  }

  // Update
  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (!title.trim() && !file) {
      setToast({ msg: 'Nothing to update', bg: 'danger' })
      return
    }

    try {
      const form = new FormData()
      if (title.trim()) form.append('title', title.trim())
      if (file) form.append('image', file)
      if (pcategoryId) form.append('productCategory', pcategoryId)
      // Note: if user clears sub selections, omit keys to keep unchanged
      if (psubcategoryId) form.append('productSubcategory', psubcategoryId)
      if (psubSubcategoryId) form.append('productSubSubcategory', psubSubcategoryId)
      await updateCategory({ id: selected._id, data: form }).unwrap()
      setToast({ msg: 'Category updated', bg: 'success' })
      resetModals()
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || 'Failed to update'
      setToast({ msg, bg: 'danger' })
    }
  }

  // Delete
  const onDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      await deleteCategory(id).unwrap()
      setToast({ msg: 'Category deleted', bg: 'success' })
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || 'Failed to delete'
      setToast({ msg, bg: 'danger' })
    }
  }

  const renderImage = (src?: string | File) => {
    if (!src) return <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ width: 48, height: 48 }}>
      <IconifyIcon icon="solar:image-broken" className="text-muted" />
    </div>
    if (typeof src === 'string') {
      return (
        <Image src={src} alt="Category" width={48} height={48} style={{ objectFit: 'cover' }} className="rounded" />
      )
    }
    return <div className="text-muted">(new image)</div>
  }

  // UI
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2">Loading Home Categories...</div>
      </div>
    )
  }

  if (isError && !notFound) {
    return (
      <Card>
        <Card.Body className="text-center text-danger">
          <div className="mb-2">Failed to load categories</div>
          <Button variant="outline-danger" onClick={() => refetch()}>Try Again</Button>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Home Categories ({categoriesList?.length || 0})</h5>
          <div className="d-flex gap-2">
            <Button onClick={handleOpenCreate}>
              <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
              Add Category
            </Button>
            <Button variant="outline-secondary" onClick={() => refetch()}>
              <IconifyIcon icon="solar:refresh-broken" className="me-1" />
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Image</th>
                <th>Title</th>
                <th>Created</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(categoriesList) && categoriesList.length > 0 ? (
                categoriesList.map((cat) => (
                  <tr key={cat._id}>
                    <td>{renderImage(typeof cat.image === 'string' ? cat.image : undefined)}</td>
                    <td className="fw-medium">{cat.title}</td>
                    <td><small className="text-muted">{cat.createdAt ? String(cat.createdAt) : '-'}</small></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="soft-primary" onClick={() => handleOpenEdit(cat)}>
                          <IconifyIcon icon="solar:pen-2-broken" />
                        </Button>
                        <Button size="sm" variant="soft-danger" disabled={isDeleting} onClick={() => onDelete(cat._id)}>
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">No categories found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={resetModals} centered>
        <Form onSubmit={onCreate} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>Add Home Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Title</Form.Label>
                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
              </Col>
              <Col md={12}>
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const input = e.currentTarget as unknown as HTMLInputElement
                    setFile(input.files?.[0] || null)
                  }}
                />
              </Col>
              <Col md={12}>
                <Form.Label>Product Category <span className="text-danger">*</span></Form.Label>
                <Form.Select value={pcategoryId} onChange={(e) => { setPcategoryId(e.target.value); setPsubcategoryId(''); setPsubSubcategoryId(''); }}>
                  <option value="">Select Category</option>
                  {(rootProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Subcategory</Form.Label>
                <Form.Select value={psubcategoryId} onChange={(e) => { setPsubcategoryId(e.target.value); setPsubSubcategoryId(''); }} disabled={!pcategoryId || loadingSubcats}>
                  <option value="">Select Subcategory (optional)</option>
                  {(childProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Sub-Subcategory</Form.Label>
                <Form.Select value={psubSubcategoryId} onChange={(e) => setPsubSubcategoryId(e.target.value)} disabled={!psubcategoryId || loadingSubSubcats}>
                  <option value="">Select Sub-Subcategory (optional)</option>
                  {(subSubProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={resetModals}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? <Spinner size="sm" animation="border" className="me-2" /> : null}
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={resetModals} centered>
        <Form onSubmit={onUpdate} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>Edit Home Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label>Title</Form.Label>
                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
              </Col>
              <Col md={12}>
                <Form.Label>Replace Image (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const input = e.currentTarget as unknown as HTMLInputElement
                    setFile(input.files?.[0] || null)
                  }}
                />
                {selected?.image && typeof selected.image === 'string' ? (
                  <div className="mt-2">
                    <small className="text-muted d-block mb-1">Current:</small>
                    {renderImage(selected.image)}
                  </div>
                ) : null}
              </Col>
              <Col md={12}>
                <Form.Label>Product Category <span className="text-danger">*</span></Form.Label>
                <Form.Select value={pcategoryId} onChange={(e) => { setPcategoryId(e.target.value); setPsubcategoryId(''); setPsubSubcategoryId(''); }}>
                  <option value="">Select Category</option>
                  {(rootProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Subcategory</Form.Label>
                <Form.Select value={psubcategoryId} onChange={(e) => { setPsubcategoryId(e.target.value); setPsubSubcategoryId(''); }} disabled={!pcategoryId || loadingSubcats}>
                  <option value="">Select Subcategory (optional)</option>
                  {(childProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Sub-Subcategory</Form.Label>
                <Form.Select value={psubSubcategoryId} onChange={(e) => setPsubSubcategoryId(e.target.value)} disabled={!psubcategoryId || loadingSubSubcats}>
                  <option value="">Select Sub-Subcategory (optional)</option>
                  {(subSubProductCategories as IProductCategory[]).map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={resetModals}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <Spinner size="sm" animation="border" className="me-2" /> : null}
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToast(null)} show={!!toast} bg={toast?.bg} delay={3000} autohide>
          <Toast.Body className="text-white">{toast?.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default HomeCategories
