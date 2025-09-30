'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useCreateBlogMutation, useDeleteBlogMutation } from '@/store/blogApi'
import { useGetBlogCategoriesQuery } from '@/store/blogCategoryApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller, Resolver } from 'react-hook-form'
import * as yup from 'yup'

interface FormValues {
  title: string
  shortDesc: string
  longDesc: string
  category: string
  status: string
  image: FileList
}

const CreateTeam = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  // redux
  const [createBlog, { isLoading }] = useCreateBlogMutation()
  const { data: blogCategory, isLoading: blogCategoryLoading } = useGetBlogCategoriesQuery()

  const schema = yup.object({
    title: yup.string().required('Please enter title'),
    shortDesc: yup.string().required('Please enter short description'),
    longDesc: yup.string().required('Please enter long description'),
    category: yup.string().required('Please select category'),
    status: yup.string().required('Please select status'),
    image: yup.mixed<FileList>().test('required', 'Image is required', (value) => value && value.length > 0),
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
    if (!image) {
      alert('Please upload an image.')
      return
    }
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('shortDesc', values.shortDesc)
    formData.append('longDesc', values.longDesc)
    formData.append('category', values.category)
    formData.append('status', values.status)
    formData.append('image', values.image[0])

    try {
      await createBlog(formData).unwrap()
      showMessage('Blog created successfully!', 'success')
      reset()
      setTimeout(() => router.push('/blog/blog-list'), 2000)
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
            <CardTitle as="h4">Create Team</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Image</label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImage(e.target.files[0])
                          field.onChange(e.target.files) // react-hook-form will store FileList
                        }
                      }}
                    />
                  )}
                />
                {errors.image && <p className="text-danger">{errors.image.message}</p>}
              </Col>

              <Col lg={6}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Name
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
                  name="title"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Desition
                      </label>
                      <input type="text" id="title" className="form-control" {...field} />
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

export default CreateTeam
