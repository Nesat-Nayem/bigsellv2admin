'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Col, 
  Row, 
  Spinner, 
  Toast, 
  ToastContainer,
  Form,
  Badge,
  Alert
} from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import TextFormInput from '@/components/form/TextFormInput'
import { 
  useGetCategoryByIdQuery, 
  useUpdateCategoryMutation,
  useGetCategoryTreeQuery,
  ICategory,
  IAttribute
} from '@/store/productCategoryApi'

const schema = yup.object().shape({
  title: yup.string().required('Please enter category title'),
  description: yup.string().optional(),
  parentId: yup.string().optional(),
  icon: yup.string().optional(),
  seoTitle: yup.string().optional(),
  seoDescription: yup.string().optional(),
  displayOrder: yup.number().optional().min(0, 'Display order must be positive')
})

const EditCategory = () => {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<IAttribute[]>([])
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  
  const router = useRouter()
  const params = useParams()

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const categoryId = typeof params?.id === 'string' ? params.id : undefined

  const {
    data: category,
    isLoading: isFetching,
    isError,
    error
  } = useGetCategoryByIdQuery(categoryId!, {
    skip: !categoryId,
  })

  // Hierarchical parent categories
  const { data: categoryTree = [], isLoading: loadingParents } = useGetCategoryTreeQuery({ maxDepth: 5 })

  // Build flattened options with indentation
  const buildParentOptions = (nodes: ICategory[] = [], depth = 0): Array<{ id: string; label: string; level?: number }> => {
    const prefix = depth > 0 ? '— '.repeat(depth) : ''
    const list: Array<{ id: string; label: string; level?: number }> = []
    nodes.forEach((n) => {
      list.push({ id: n._id, label: `${prefix}${n.title}`, level: n.level })
      if (n.children && n.children.length > 0) {
        list.push(...buildParentOptions(n.children, depth + 1))
      }
    })
    return list
  }
  const parentOptions = buildParentOptions(categoryTree as ICategory[])
  
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      parentId: '',
      icon: '',
      seoTitle: '',
      seoDescription: '',
      displayOrder: 0
    }
  })

  // Initialize form data when category is loaded
  useEffect(() => {
    if (category) {
      reset({
        title: category.title || '',
        description: category.description || '',
        parentId: category.parentId || '',
        icon: category.icon || '',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        displayOrder: category.displayOrder || 0
      })
      
      // Set attributes
      if (category.attributes) {
        setAttributes(category.attributes)
      }
      
      // Set SEO keywords
      if (category.seoKeywords && Array.isArray(category.seoKeywords)) {
        setSeoKeywords(category.seoKeywords)
      }
      
      // Set current image preview
      if (category.image && typeof category.image === 'string') {
        setImagePreview(category.image)
      }
    }
  }, [category, reset])

  // Toast helper
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add attribute
  const addAttribute = () => {
    const newAttribute: IAttribute = {
      name: '',
      type: 'text',
      required: false,
      options: []
    }
    setAttributes([...attributes, newAttribute])
  }

  // Remove attribute
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  // Update attribute
  const updateAttribute = (index: number, field: keyof IAttribute, value: any) => {
    const updated = attributes.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    )
    setAttributes(updated)
  }

  // Add SEO keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !seoKeywords.includes(keywordInput.trim())) {
      setSeoKeywords([...seoKeywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  // Remove SEO keyword
  const removeKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter(k => k !== keyword))
  }

  const onSubmit = async (values: any) => {
    if (!categoryId) return

    const formData = new FormData()
    formData.append('title', values.title)
    if (values.description) formData.append('description', values.description)
    // Always send parentId so backend can set root when blank
    formData.append('parentId', values.parentId ? values.parentId : 'null')
    if (values.icon) formData.append('icon', values.icon)
    if (values.seoTitle) formData.append('seoTitle', values.seoTitle)
    if (values.seoDescription) formData.append('seoDescription', values.seoDescription)
    if (values.displayOrder !== undefined) formData.append('displayOrder', values.displayOrder.toString())
    if (seoKeywords.length > 0) formData.append('seoKeywords', JSON.stringify(seoKeywords))
    if (attributes.length > 0) formData.append('attributes', JSON.stringify(attributes))
    if (image) formData.append('image', image)

    try {
      await updateCategory({ id: categoryId, data: formData }).unwrap()
      showMessage('Category updated successfully!', 'success')
      setTimeout(() => {
        router.push('/category/category-list')
      }, 2000)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update category', 'error')
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

  if (isError) {
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
              <h4 className="mb-1">Edit Category</h4>
              <p className="text-muted mb-0">Update category information</p>
            </div>
            <Link href="/category/category-list" className="btn btn-outline-secondary">
              <IconifyIcon icon="solar:arrow-left-broken" className="me-1" />
              Back to List
            </Link>
          </div>
        </Col>
      </Row>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={8}>
            {/* Basic Information */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">Basic Information</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <TextFormInput 
                      control={control} 
                      name="title" 
                      label="Category Title" 
                      placeholder="Enter category title" 
                    />
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Parent Category</label>
                      <Controller
                        name="parentId"
                        control={control}
                        render={({ field }) => (
                          <select className="form-select" {...field}>
                            <option value="">Select Parent (Root Category)</option>
                            {parentOptions
                              .filter((opt) => opt.id !== categoryId)
                              .map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label} {opt.level !== undefined && `(Level ${opt.level})`}
                                </option>
                              ))}
                          </select>
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <textarea 
                            className="form-control" 
                            rows={3} 
                            placeholder="Enter category description"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={6}>
                    <TextFormInput 
                      control={control} 
                      name="icon" 
                      label="Icon Class" 
                      placeholder="e.g., fas fa-tshirt" 
                    />
                    <small className="text-muted">FontAwesome or Solar icon class</small>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Display Order</label>
                      <Controller
                        name="displayOrder"
                        control={control}
                        render={({ field }) => (
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="0"
                            min="0"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Category Attributes */}
            <Card className="mb-4">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle as="h5">Category Attributes</CardTitle>
                <Button variant="outline-primary" size="sm" onClick={addAttribute}>
                  <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                  Add Attribute
                </Button>
              </CardHeader>
              <CardBody>
                {attributes.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    <IconifyIcon icon="solar:info-circle-broken" className="me-2" />
                    No attributes defined. Click &quot;Add Attribute&quot; to add product attributes for this category.
                  </Alert>
                ) : (
                  attributes.map((attr, index) => (
                    <Card key={index} className="mb-3 border">
                      <CardBody className="py-3">
                        <Row className="align-items-center">
                          <Col md={3}>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Attribute name"
                              value={attr.name}
                              onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                            />
                          </Col>
                          <Col md={2}>
                            <select
                              className="form-select form-select-sm"
                              value={attr.type}
                              onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                            >
                              <option value="text">Text</option>
                              <option value="select">Select</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                            </select>
                          </Col>
                          <Col md={4}>
                            {attr.type === 'select' && (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Options (comma separated)"
                                value={attr.options?.join(', ') || ''}
                                onChange={(e) => updateAttribute(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                              />
                            )}
                          </Col>
                          <Col md={2}>
                            <Form.Check
                              type="checkbox"
                              label="Required"
                              checked={attr.required}
                              onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                            />
                          </Col>
                          <Col md={1}>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeAttribute(index)}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                            </Button>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  ))
                )}
              </CardBody>
            </Card>

            {/* SEO Information */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">SEO Information</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput 
                      control={control} 
                      name="seoTitle" 
                      label="SEO Title" 
                      placeholder="Enter SEO title" 
                    />
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label className="form-label">SEO Description</label>
                      <Controller
                        name="seoDescription"
                        control={control}
                        render={({ field }) => (
                          <textarea 
                            className="form-control" 
                            rows={3} 
                            placeholder="Enter SEO description"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label className="form-label">SEO Keywords</label>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Add keyword"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        />
                        <Button variant="outline-secondary" onClick={addKeyword}>Add</Button>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        {seoKeywords.map((keyword) => (
                          <Badge 
                            key={keyword} 
                            bg="secondary" 
                            className="d-flex align-items-center gap-1"
                          >
                            {keyword}
                            <IconifyIcon 
                              icon="solar:close-circle-broken" 
                              className="cursor-pointer" 
                              onClick={() => removeKeyword(keyword)}
                              style={{ cursor: 'pointer' }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Category Image */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle as="h5">Category Image</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-control" 
                    onChange={handleImageChange} 
                  />
                  <small className="text-muted">Leave empty to keep current image. Recommended size: 300x300px</small>
                </div>
                
                {imagePreview && (
                  <div className="text-center">
                    <div className="mb-2">
                      <label className="form-label">
                        {image ? 'New Image Preview:' : 'Current Image:'}
                      </label>
                    </div>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded border"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Category Info */}
            {category && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle as="h5">Category Info</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">ID:</span>
                      <code className="small">{category._id}</code>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Level:</span>
                      <Badge bg="info">{category.level || 0}</Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Status:</span>
                      <Badge bg={category.isActive !== false ? 'success' : 'danger'}>
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Created:</span>
                      <small>
                        {category.createdAt 
                          ? new Date(category.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Updated:</span>
                      <small>
                        {category.updatedAt 
                          ? new Date(category.updatedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardBody>
                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <IconifyIcon icon="solar:refresh-broken" className="me-1 spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <IconifyIcon icon="solar:check-circle-broken" className="me-1" />
                        Update Category
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary"
                    onClick={() => router.push('/category/category-list')}
                  >
                    <IconifyIcon icon="solar:close-circle-broken" className="me-1" />
                    Cancel
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </form>

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
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default EditCategory
