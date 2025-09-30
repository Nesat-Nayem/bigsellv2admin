'use client'

import PageTItle from '@/components/PageTItle'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Button, Toast, ToastContainer } from 'react-bootstrap'
import { useCreateFaqMutation } from '@/store/faqApi'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

//   Validation schema
const messageSchema = yup.object({
  question: yup.string().required('Please enter a question'),
  answer: yup.string().required('Please enter an answer'),
  status: yup.string().required('Please select status'),
})

type FormValues = {
  question: string
  answer: string
  status: string
}

const FaqsPage = () => {
  //   Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const [createFaq, { isLoading }] = useCreateFaqMutation()

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      question: '',
      answer: '',
      status: '',
    },
  })

  //   Toast trigger
  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await createFaq({
        question: values.question,
        answer: values.answer,
        status: values.status,
      }).unwrap()

      showMessage('FAQ created successfully!', 'success')
      setTimeout(() => router.push('/support/faqs'), 2000)
      reset()
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create FAQ', 'danger')
    }
  }

  return (
    <>
      <PageTItle title="FAQS" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Add FAQ</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={12} className="mb-3">
                <label htmlFor="question" className="form-label">
                  Question
                </label>
                <Controller
                  name="question"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input {...field} id="question" className="form-control" placeholder="Enter question" />
                      {error && <div className="text-danger small">{error.message}</div>}
                    </>
                  )}
                />
              </Col>

              <Col lg={12} className="mb-3">
                <label htmlFor="answer" className="form-label">
                  Answer
                </label>
                <Controller
                  name="answer"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input {...field} id="answer" className="form-control" placeholder="Enter answer" />
                      {error && <div className="text-danger small">{error.message}</div>}
                    </>
                  )}
                />
              </Col>

              <Col lg={12} className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <select {...field} id="status" className="form-control">
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="InActive">InActive</option>
                      </select>
                      {error && <div className="text-danger small">{error.message}</div>}
                    </>
                  )}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Create'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/*   Toast Notification */}
      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default FaqsPage
