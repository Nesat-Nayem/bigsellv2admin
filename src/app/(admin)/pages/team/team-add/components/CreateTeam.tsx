'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useCreateTeamMutation } from '@/store/teamApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller, Resolver } from 'react-hook-form'
import * as yup from 'yup'

interface FormValues {
  name: string
  designation: string
  image: FileList
}

const CreateTeam = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  // redux
  const [createTeam, { isLoading }] = useCreateTeamMutation()

  const schema = yup.object({
    name: yup.string().required('Please enter name'),
    designation: yup.string().required('Please enter designation'),
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
    formData.append('name', values.name)
    formData.append('designation', values.designation)
    formData.append('image', values.image[0])

    try {
      await createTeam(formData).unwrap()
      showMessage('Team created successfully!', 'success')
      reset()
      setTimeout(() => router.push('/pages/team/team-list'), 2000)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create team', 'error')
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
                  name="name"
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
                  name="designation"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Designation
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
