'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import Link from 'next/link'
import TextFormInput from '@/components/form/TextFormInput'
import { useCreateCategoryMutation } from '@/store/categoryApi'
import { useRouter } from 'next/navigation'
const schema = yup.object().shape({
  title: yup.string().required('Please enter title'),
})

const AddSubCategory = () => {
  const [image, setImage] = useState<File | null>(null)

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const [createCategory, { isLoading }] = useCreateCategoryMutation()

  // Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: any) => {
    if (!image) {
      showMessage('Please upload an image.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('image', image)

    try {
      await createCategory(formData).unwrap()
      showMessage('Category created successfully!', 'success')
      setTimeout(() => {
        router.push('/category/category-list')
      }, 2000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create category', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">General Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Main Category</label>
                  <select name="" id="" className="form-control form-select">
                    <option value="">Select Main Category</option>
                    <option value="1">Main Category 1</option>
                    <option value="2">Main Category 2</option>
                    <option value="3">Main Category 3</option>
                  </select>
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input type="text" className="form-control" placeholder="Category Name" />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default AddSubCategory
