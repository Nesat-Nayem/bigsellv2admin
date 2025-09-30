import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'

const ItemDetails = () => {
  return (
    <Col lg={12}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Items Detail</CardTitle>
        </CardHeader>
        <CardBody>
          <div>
            <ul className="d-flex flex-column gap-2 list-unstyled fs-14 text-muted mb-0">
              <li>
                <span className="fw-medium text-dark">Product Dimensions</span>
                <span className="mx-2">:</span>53.3 x 40.6 x 6.4 cm; 500 Grams
              </li>
              <li>
                <span className="fw-medium text-dark">SKU Number</span>
                <span className="mx-2">:</span>#9078657
              </li>
              <li>
                <span className="fw-medium text-dark">Category</span>
                <span className="mx-2">:</span>Fashion
              </li>
              <li>
                <span className="fw-medium text-dark">Tag </span>
                <span className="mx-2">:</span>#fashion , #Electrinocs
              </li>
              <li>
                <span className="fw-medium text-dark">Price</span>
                <span className="mx-2">:</span>AED 200
              </li>
              <li>
                <span className="fw-medium text-dark">Discount</span>
                <span className="mx-2">:</span>
              </li>
              <li>
                <span className="fw-medium text-dark">Tax</span>
                <span className="mx-2">:</span>
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default ItemDetails
