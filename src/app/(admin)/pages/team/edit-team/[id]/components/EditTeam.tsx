'use client'

import { useGetTeamByIdQuery, useUpdateTeamMutation } from '@/store/teamApi'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

//   Define Form types
interface FormValues {
  name: string
  designation: string
  image?: File
}

//   Validation schema
const messageSchema = yup.object().shape({
  name: yup.string().required('Please enter name'),
  designation: yup.string().required('Please enter designation'),
})

const EditTeam = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const teamId = typeof params?.id === 'string' ? params.id : undefined

  const {
    data: team,
    isFetching,
    isError,
  } = useGetTeamByIdQuery(teamId!, {
    skip: !teamId,
  })
  const [updateTeam, { isLoading }] = useUpdateTeamMutation()
  //   useForm strictly typed
  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      name: '',
      designation: '',
      image: undefined,
    },
  })
  //   Populate when blog loads
  useEffect(() => {
    if (team) {
      reset({
        name: team.name || '',
        designation: team.designation || '',
        image: undefined,
      })
      //   set preview from API if exists
      if (typeof team.image === 'string') {
        setImagePreview(team.image)
      } else {
        setImagePreview(null)
      }
    }
  }, [team, reset])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!teamId) return
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('designation', values.designation)
    if (values.image) formData.append('image', values.image)

    try {
      await updateTeam({ id: teamId, data: formData }).unwrap()
      showMessage('Team updated successfully!', 'success')
      setTimeout(() => router.push('/pages/team/team-list'), 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update team', 'error')
    }
  }

  if (!teamId) return <div className="text-danger">Invalid Team ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load Team data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Edit Team</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <label className="form-label">Image</label>
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
                  name="name"
                  render={({ field, fieldState }) => (
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" {...field} />
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
                      <label className="form-label">Designation</label>
                      <input type="text" className="form-control" {...field} />
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

export default EditTeam
