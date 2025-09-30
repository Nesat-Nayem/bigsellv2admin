'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import * as yup from 'yup'
import PageTitle from '@/components/PageTItle'
import { useGetFaqByIdQuery, useUpdateFaqMutation } from '@/store/faqApi'

//   form values type
interface FormValues {
  question: string
  answer: string
  status: string
}

const FaqsPage = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()

  const faqId = typeof params?.id === 'string' ? params.id : undefined
  const { data: faq, isFetching, isError } = useGetFaqByIdQuery(faqId!, { skip: !faqId })
  const [updateFaq] = useUpdateFaqMutation()

  const messageSchema = yup.object({
    question: yup.string().required('Please enter question'),
    answer: yup.string().required('Please enter answer'),
    status: yup.string().required('Please select status'),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      question: '',
      answer: '',
      status: '',
    },
  })

  //   Prefill when FAQ data loads
  useEffect(() => {
    if (faq) {
      reset({
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
      })
    }
  }, [faq, reset])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!faqId) return

    try {
      await updateFaq({ id: faqId, data: values }).unwrap() // 👈 send plain JSON
      showMessage('FAQ updated successfully!', 'success')
      setTimeout(() => router.push('/support/faqs'), 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update FAQ', 'error')
    }
  }

  if (!faqId) return <div className="text-danger">Invalid FAQ ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load FAQ data.</div>

  return (
    <>
      <PageTitle title="FAQS" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Edit FAQ</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={12}>
                <label htmlFor="question" className="form-label">
                  Question
                </label>
                <Controller name="question" control={control} render={({ field }) => <input {...field} id="question" className="form-control" />} />
                {errors.question && <small className="text-danger">{errors.question.message}</small>}
              </Col>

              <Col lg={12} className="mt-3">
                <label htmlFor="answer" className="form-label">
                  Answer
                </label>
                <Controller name="answer" control={control} render={({ field }) => <input {...field} id="answer" className="form-control" />} />
                {errors.answer && <small className="text-danger">{errors.answer.message}</small>}
              </Col>

              <Col lg={12} className="mt-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select {...field} id="status" className="form-control">
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
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
              <Button type="submit" className="success w-100">
                Update
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/*   Toast Notification */}
      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'error' ? 'danger' : 'success'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default FaqsPage
