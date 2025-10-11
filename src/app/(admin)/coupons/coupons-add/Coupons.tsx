'use client'

import CustomFlatpickr from '@/components/CustomFlatpickr'
import TextFormInput from '@/components/form/TextFormInput'
import PageTitle from '@/components/PageTItle'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { useCreateCouponMutation } from '@/store/couponApi'
import { useRouter } from 'next/navigation'
import React from 'react'

const couponSchema = yup.object({
  code: yup.string().required('Please enter Coupons Code'),
  discount: yup.string().required('Please enter Discount Value'),
  status: yup.string().required(),
  startDate: yup.date().required(),
  endDate: yup.date().required(),
})

const Coupons = () => {
  const router = useRouter()
  const [createCoupon, { isLoading }] = useCreateCouponMutation()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(couponSchema),
    defaultValues: {
      status: 'active',
    },
  })

  const onSubmit = async (data: any) => {
    setErrorMsg(null)
    const payload = {
      code: String(data.code || '').toUpperCase(),
      discountType: 'percentage' as const,
      discountValue: Number(data.discount || 0),
      startDate: data.startDate,
      endDate: data.endDate,
      status: (data.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    }
    try {
      await createCoupon(payload).unwrap()
      router.push('/coupons/coupons-list')
    } catch (e) {
      const msg = (e as any)?.data?.message || 'Failed to create coupon'
      setErrorMsg(msg)
    }
  }

  return (
    <>
      <PageTitle title="COUPONS ADD" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Left Column */}
          <Col lg={5}>
            {/* Coupon Status */}
            <Card>
              <CardHeader>
                <CardTitle as={'h4'}>Coupon Status</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="form-check">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              className="form-check-input"
                              type="radio"
                              value="active"
                              checked={field.value === 'active'}
                              id="status-active"
                            />
                            <label className="form-check-label" htmlFor="status-active">
                              Active
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="form-check">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <>
                            <input
                              {...field}
                              className="form-check-input"
                              type="radio"
                              value="inactive"
                              checked={field.value === 'inactive'}
                              id="status-inactive"
                            />
                            <label className="form-check-label" htmlFor="status-inactive">
                              Inactive
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Date Schedule */}
            <Card>
              <CardHeader>
                <CardTitle as={'h4'}>Date Schedule</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <label className="form-label text-dark">Start Date</label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <CustomFlatpickr {...field} className="form-control" placeholder="dd-mm-yyyy" options={{ enableTime: false }} />
                    )}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark">End Date</label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <CustomFlatpickr {...field} className="form-control" placeholder="dd-mm-yyyy" options={{ enableTime: false }} />
                    )}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right Column */}
          <Col lg={7}>
            <Card>
              <CardHeader>
                <CardTitle as={'h4'}>Coupon Information</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={12}>
                    <TextFormInput control={control} type="text" name="code" label="Coupons Code" placeholder="Enter code" />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col lg={12}>
                    <TextFormInput control={control} type="text" name="discount" label="Discount Value" placeholder="Enter value" />
                  </Col>
                </Row>
              </CardBody>
              <CardFooter className="border-top">
                <Button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Coupon'}
                </Button>
                {errorMsg && <div className="alert alert-danger mt-2 mb-0">{errorMsg}</div>}
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </form>
    </>
  )
}

export default Coupons
