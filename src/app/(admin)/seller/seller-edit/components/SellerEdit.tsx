'use client'
import FileUpload from '@/components/FileUpload'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import Nouislider from 'nouislider-react'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Modal } from 'react-bootstrap'
import { useSearchParams } from 'next/navigation'
import { useGetSellerByIdQuery, useUpdateSellerStatusMutation } from '@/store/sellerApi'
import { toast } from 'react-toastify'

const SellerEdit = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const { data: vendor, isLoading } = useGetSellerByIdQuery(id, { skip: !id })
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [updateStatus, { isLoading: isSaving }] = useUpdateSellerStatusMutation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (vendor?.kycStatus) setStatus(vendor.kycStatus)
  }, [vendor])

  const handleSave = async () => {
    if (!id) {
      toast.error('❌ Seller ID is missing!', {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }
    
    // Show loading toast
    const loadingToast = toast.loading('🔄 Updating seller status...', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    })
    
    try {
      await updateStatus({ id, kycStatus: status }).unwrap()
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      // Success toast with dynamic message based on status
      const statusMessages = {
        approved: '✅ Seller approved successfully! They can now start selling.',
        rejected: '❌ Seller application rejected. Email notification sent.',
        pending: '⏳ Seller status updated to pending review.'
      }
      
      toast.success(statusMessages[status], {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          fontSize: '14px',
          fontWeight: '500'
        }
      })
      
      // Show additional info for approved sellers
      if (status === 'approved') {
        setTimeout(() => {
          toast.info('📧 Welcome email with dashboard access sent to the seller', {
            position: 'top-right',
            autoClose: 5000,
          })
        }, 1500)
        
        setTimeout(() => {
          toast.success('🎯 Seller can now access their dashboard at: bigselladmin.atpuae.com', {
            position: 'top-right',
            autoClose: 7000,
          })
        }, 3000)
      }
      
    } catch (e: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      const errorMessage = e?.data?.message || e?.message || 'Failed to update seller status'
      
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          fontSize: '14px',
          fontWeight: '500'
        }
      })
      
      // Additional info toast for common errors
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        setTimeout(() => {
          toast.info('💡 Please check your internet connection and try again', {
            position: 'top-right',
            autoClose: 4000
          })
        }, 1000)
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        setTimeout(() => {
          toast.warning('🔐 You may need to refresh your session', {
            position: 'top-right',
            autoClose: 5000
          })
        }, 1000)
      }
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

    {/* Image Preview Modal */}
    <Modal show={!!previewUrl} onHide={() => setPreviewUrl(null)} size="lg" centered>
      <Modal.Body className="p-0">
        {previewUrl && (
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
        )}
      </Modal.Body>
    </Modal>

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

            {/* removed plan/payment fields */}

            {/* Plan cost */}
            <Col lg={6}>
              <form>
                <div className="mb-3">
                  <label htmlFor="full-name" className="form-label">
                    Aadhar Card
                  </label>
                  {vendor?.aadharUrl ? (
                    <Image src={vendor.aadharUrl} alt="Aadhar" className="img-fluid" height={120} width={180} style={{cursor:'pointer'}} onClick={() => setPreviewUrl(vendor.aadharUrl)} />
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
                    <Image src={vendor.panUrl} alt="PAN" className="img-fluid" height={120} width={180} style={{cursor:'pointer'}} onClick={() => setPreviewUrl(vendor.panUrl)} />
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
