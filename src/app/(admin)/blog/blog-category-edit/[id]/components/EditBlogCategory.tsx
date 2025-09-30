'use client'

import { useGetBlogCategoryByIdQuery, useUpdateBlogCategoryMutation } from '@/store/blogCategoryApi'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

//   Validation Schema
const schema = yup.object().shape({
  categoryName: yup.string().required('Please enter category name'),
  status: yup.string().oneOf(['Active', 'Inactive'], 'Invalid status').required('Select status'),
})

type FormValues = {
  categoryName: string
  status: 'Active' | 'Inactive'
}

const EditBlogCategory = () => {
  const router = useRouter()
  const params = useParams()

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const categoryId = typeof params?.id === 'string' ? params.id : undefined

  const { data: category, isLoading: isFetching, isError } = useGetBlogCategoryByIdQuery(categoryId!, { skip: !categoryId })
  const [updateCategory, { isLoading }] = useUpdateBlogCategoryMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryName: '',
      status: 'Active',
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        categoryName: category.categoryName ?? '',
        status: category.status ?? 'Active',
      })
    }
  }, [category, reset])

  const onSubmit = async (values: FormValues) => {
    if (!categoryId) return
    try {
      // send JSON directly
      await updateCategory({ id: categoryId, data: values }).unwrap()

      setToastMessage('Category updated successfully!')
      setTimeout(() => {
        router.push('/blog/blog-category')
      }, 2000)
    } catch (err: any) {
      console.error('Update Error:', err)
      setToastMessage(err?.data?.message || 'Failed to update category')
    }
  }

  if (!categoryId) return <div className="text-danger">Invalid category ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load category data.</div>

  return (
    <>
      {toastMessage && <div className="alert alert-info">{toastMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Edit Blog Category</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label htmlFor="Title" className="form-label">
                  Category Name
                </label>
                <Controller
                  name="categoryName"
                  control={control}
                  render={({ field }) => <input type="text" id="Title" className="form-control" {...field} />}
                />
                {errors.categoryName && <small className="text-danger">{errors.categoryName.message}</small>}
              </Col>

              <Col lg={6}>
                <label htmlFor="Status" className="form-label">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select id="Status" className="form-control" {...field}>
                      <option value="Active">Active</option>
                      <option value="Inactive">InActive</option> {/* matches Yup */}
                    </select>
                  )}
                />

                {errors.status && <small className="text-danger">{errors.status.message}</small>}
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </Col>
            <Col lg={2}>
              <Link href="/category/category-list" className="btn btn-outline-secondary w-100">
                Cancel
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </>
  )
}

export default EditBlogCategory
