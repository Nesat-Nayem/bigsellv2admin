'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useCreateBlogCategoryMutation } from '@/store/blogCategoryApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller, Resolver } from 'react-hook-form'
import * as yup from 'yup'

interface FormValues {
  categoryName: string
  status: string
}

const AddBlogCategory = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  // redux
  const [createBlogCategory, { isLoading }] = useCreateBlogCategoryMutation()

  const schema = yup.object({
    categoryName: yup.string().required('Please enter title'),
    status: yup.string().required('Please select status'),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues, any>,
  })

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await createBlogCategory(values).unwrap() // send JSON
      showMessage('Blog created successfully!', 'success')
      reset()
      setTimeout(() => router.push('/blog/blog-category'), 2000)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create blog', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Create Blog</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <Controller
                  control={control}
                  name="categoryName"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Title
                      </label>
                      <input type="text" id="title" className="form-control" {...field} />
                      {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                    </div>
                  )}
                />
              </Col>

              <Col lg={6}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select className="form-control form-select" {...field}>
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">InActive</option>
                      </select>
                      {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                    </div>
                  )}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default AddBlogCategory
