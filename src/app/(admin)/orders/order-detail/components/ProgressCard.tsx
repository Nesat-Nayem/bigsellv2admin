import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'

const ProgressCard = () => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h4 className="fw-medium text-dark d-flex align-items-center gap-2">
              #0758267/90 <span className="badge bg-success-subtle text-success  px-2 py-1 fs-13">Paid</span>
              <span className="border border-warning text-warning fs-13 px-2 py-1 rounded">In Progress</span>
            </h4>
            <p className="mb-0">Order / Order Details / #0758267/90 - April 23 , 2024 at 6:23 pm</p>
          </div>
          <div>
            <Link href="" className="btn btn-outline-secondary">
              Refund
            </Link>
            &nbsp;
            <Link href="" className="btn btn-outline-secondary">
              Return
            </Link>
            &nbsp;
            <Link href="" className="btn btn-primary">
              Edit Order
            </Link>
            &nbsp;
          </div>
        </div>
      </CardBody>
      <CardFooter className="d-flex flex-wrap align-items-center justify-content-between bg-light-subtle gap-2">
        <p className="border rounded mb-0 px-2 py-1 bg-body">
          <IconifyIcon icon="bx:arrow-from-left" className="align-middle fs-16" /> Estimated shipping date :{' '}
          <span className="text-dark fw-medium">Apr 25 , 2024</span>
        </p>
        <div>
          <Link href="" className="btn btn-primary">
            Make As Ready To Ship
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ProgressCard
