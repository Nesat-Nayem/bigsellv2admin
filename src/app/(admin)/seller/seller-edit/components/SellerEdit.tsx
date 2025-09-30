'use client'
import FileUpload from '@/components/FileUpload'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import Nouislider from 'nouislider-react'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useSearchParams } from 'next/navigation'
import { useGetSellerByIdQuery, useUpdateSellerStatusMutation } from '@/store/sellerApi'

const SellerEdit = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const { data: vendor, isLoading } = useGetSellerByIdQuery(id, { skip: !id })
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [updateStatus, { isLoading: isSaving }] = useUpdateSellerStatusMutation()

  useEffect(() => {
    if (vendor?.kycStatus) setStatus(vendor.kycStatus)
  }, [vendor])

  const handleSave = async () => {
    if (!id) return
    try {
      await updateStatus({ id, kycStatus: status }).unwrap()
      alert('Status updated successfully')
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update status')
    }
  }
  return (
    <Col xl={12} lg={12}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Seller Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* name */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Full Name
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.vendorName || ''} disabled />
                </div>
              </form>
            </Col>

            {/* email */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Email Address
                  </label>
                  <input type="email" id="full-name" className="form-control" value={vendor?.email || ''} disabled />
                </div>
              </form>
            </Col>

            {/* phone */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Phone Number
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.phone || ''} disabled />
                </div>
              </form>
            </Col>

            {/* GST */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    GST Number (Optional)
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.gstNo || ''} disabled />
                </div>
              </form>
            </Col>

            {/* Business Address */}
            <Col lg={12}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Business Address
                  </label>
                  <textarea className="form-control" id="exampleFormControlTextarea1" rows={3} value={vendor?.address || ''} disabled />
                </div>
              </form>
            </Col>

            {/* category */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Plan Purchased
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.planName || ''} disabled />
                </div>
              </form>
            </Col>

            {/* Plan Purchased */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Payment Status
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.paymentStatus || 'pending'} disabled />
                </div>
              </form>
            </Col>

            {/* Plan Purchased */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Payment Cost
                  </label>
                  <input type="text" id="full-name" className="form-control" value={vendor?.paymentAmount ? `Rs,${vendor.paymentAmount}` : ''} disabled />
                </div>
              </form>
            </Col>

            {/* Plan cost */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Aadhar Card
                  </label>
                  {vendor?.aadharUrl ? (
                    <Image src={vendor.aadharUrl} alt="Aadhar" className="img-fluid" height={120} width={180} />
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </form>
            </Col>
            {/* pan */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Pan Card
                  </label>
                  {vendor?.panUrl ? (
                    <Image src={vendor.panUrl} alt="PAN" className="img-fluid" height={120} width={180} />
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </form>
            </Col>

            {/* status */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Status
                  </label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="form-control form-select">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <button onClick={handleSave} className="btn btn-primary w-100" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Change'}
            </button>
          </Col>
        </Row>
      </div>
    </Col>
  )
}

export default SellerEdit
