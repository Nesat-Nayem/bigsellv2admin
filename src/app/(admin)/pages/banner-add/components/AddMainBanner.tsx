'use client'

import { useCreatemainBannerMutation } from '@/store/mainBannerApi'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller, Resolver } from 'react-hook-form'
import * as yup from 'yup'

interface FormValues {
  title: string
  image: FileList | null
}

const AddMainBanner = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  // redux
  const [createBanner, { isLoading }] = useCreatemainBannerMutation()

  const schema = yup.object({
    title: yup.string().required('Title is required'),
    image: yup
      .mixed<FileList>()
      .required('Image is required')
      .test('file-required', 'Image is required', (value) => !!value && value.length > 0),
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
      if (!values.image || values.image.length === 0) {
        showMessage('Image is required', 'error')
        return
      }

      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('image', values.image[0]) // take first file

      await createBanner(formData).unwrap()
      showMessage('Banner created successfully!', 'success')
      reset()
      setTimeout(() => router.push('/pages/main-banner'), 2000)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create Banner', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Create Main Banner</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6} className="mb-3">
                <label className="form-label">Title</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <input type="text" placeholder="Enter banner title" className="form-control" {...field} />}
                />
                {errors.title && <p className="text-danger">{errors.title.message}</p>}
              </Col>

              <Col lg={6}>
                <label className="form-label">Upload Banner</label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => {
                        const files = e.target.files
                        field.onChange(files)
                        if (files && files[0]) {
                          setPreview(URL.createObjectURL(files[0]))
                        }
                      }}
                    />
                  )}
                />
                {errors.image && <p className="text-danger">{errors.image.message}</p>}
              </Col>

              {preview && (
                <Col lg={6} className="mt-3">
                  <p>Preview:</p>
                  <Image width={200} height={200} src={preview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: 200 }} />
                </Col>
              )}
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

export default AddMainBanner
