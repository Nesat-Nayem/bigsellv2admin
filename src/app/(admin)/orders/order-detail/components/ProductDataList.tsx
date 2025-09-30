import { currency } from '@/context/constants'
import { getAllOrders } from '@/helpers/data'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'

const ProductDataList = async () => {
  const productData = await getAllOrders()
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Product</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <table className="table align-middle mb-0 table-hover table-centered">
            <thead className="bg-light-subtle border-bottom">
              <tr>
                <th>Product Name &amp; Size</th>
                <th>Payment Status</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                      <Image src="/no-image.png" alt="productImg" className="avatar-md" width={50} height={50} />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-15">
                        The packing has been started
                      </Link>
                      <p className="text-muted mb-0 mt-1 fs-13">
                        <span>Size : </span>M
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-success">Paid</span>
                </td>
                <td>1</td>
                <td>
                  {currency}
                  200
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

export default ProductDataList
