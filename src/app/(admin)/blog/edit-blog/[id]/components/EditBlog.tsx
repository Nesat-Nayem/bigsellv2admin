'use client'

import { useGetBlogByIdQuery, useUpdateBlogMutation } from '@/store/blogApi'
import { useGetBlogCategoriesQuery } from '@/store/blogCategoryApi'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

//   Define Form types
interface FormValues {
  title: string
  shortDesc: string
  longDesc: string
  category: string
  status: string
  image?: File
}

//   Validation schema
const messageSchema = yup.object().shape({
  title: yup.string().required('Please enter title'),
  shortDesc: yup.string().required('Please enter short description'),
  longDesc: yup.string().required('Please enter long description'),
  category: yup.string().required('Please select category'),
  status: yup.string().required('Please select status'),
})

const EditBlog = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const blogId = typeof params?.id === 'string' ? params.id : undefined

  const {
    data: blog,
    isFetching,
    isError,
  } = useGetBlogByIdQuery(blogId!, {
    skip: !blogId,
  })
  const [updateBlog, { isLoading }] = useUpdateBlogMutation()
  const { data: blogCategory, isLoading: blogCategoryLoading } = useGetBlogCategoriesQuery()
  //   useForm strictly typed
  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      shortDesc: '',
      longDesc: '',
      category: '',
      status: '',
      image: undefined,
    },
  })
  //   Populate when blog loads
  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title || '',
        shortDesc: blog.shortDesc || '',
        longDesc: blog.longDesc || '',
        category: blog.category || '',
        status: blog.status || '',
        image: undefined,
      })
      //   set preview from API if exists
      if (typeof blog.image === 'string') {
        setImagePreview(blog.image)
      } else {
        setImagePreview(null)
      }
    }
  }, [blog, reset])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!blogId) return
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('status', values.status)
    formData.append('shortDesc', values.shortDesc)
    formData.append('longDesc', values.longDesc)
    formData.append('category', values.category)
    if (values.image) formData.append('image', values.image)

    try {
      await updateBlog({ id: blogId, data: formData }).unwrap()
      showMessage('Blog updated successfully!', 'success')
      setTimeout(() => router.push('/blog/blog-list'), 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update blog', 'error')
    }
  }

  if (!blogId) return <div className="text-danger">Invalid Blog ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load Blog data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Edit Blog</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Upload Banner</label>
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          field.onChange(file)
                          if (file) {
                            setImagePreview(URL.createObjectURL(file))
                          }
                        }}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <Image
                            src={imagePreview}
                            width={120}
                            height={120}
                            alt="preview"
                            style={{
                              maxHeight: 150,
                              borderRadius: 8,
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                />
              </Col>

              <Col lg={6}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-control" {...field} />
                      {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                    </div>
                  )}
                />
              </Col>

              <Col lg={6}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">
                        Category
                      </label>

                      <select className="form-control form-select" {...field}>
                        {blogCategoryLoading ? (
                          <option>Loading...</option>
                        ) : (
                          blogCategory?.map((category: any) => (
                            <option key={category._id} value={category.categoryName}>
                              {category.categoryName}
                            </option>
                          ))
                        )}
                      </select>
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
                      <label className="form-label">Status</label>
                      <select className="form-control form-select" {...field}>
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="InActive">InActive</option>
                      </select>
                      {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                    </div>
                  )}
                />
              </Col>

              <Col lg={12}>
                <Controller
                  control={control}
                  name="shortDesc"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label className="form-label">Short Description</label>
                      <textarea rows={4} className="form-control" {...field}></textarea>
                      {fieldState.error && <small className="text-danger">{fieldState.error.message}</small>}
                    </div>
                  )}
                />
              </Col>

              <Col lg={12}>
                <Controller
                  control={control}
                  name="longDesc"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label className="form-label">Long Description</label>
                      <textarea rows={7} className="form-control" {...field}></textarea>
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

export default EditBlog
