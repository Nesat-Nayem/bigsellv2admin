'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { useGetProductByIdQuery, IProduct } from '@/store/productsApi'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, Col, Row, CardHeader, ListGroup } from 'react-bootstrap'
import { toast } from 'react-toastify'

interface Dimensions {
  length: number
  width: number
  height: number
}

interface ShippingInfo {
  freeShipping: boolean
  shippingCost?: number
}

interface Product {
  sku: string
  name: string
  price: number
  originalPrice: number
  discount: number
  stock: number
  brand: string | { title?: string }
  vendor: string | { title?: string }
  category: string | { title?: string }
  subcategory: string | { title?: string }
  isFeatured: boolean
  isNewArrival: boolean
  weight?: number
  dimensions?: Dimensions
  tags?: string[]
  colors?: string[]
  sizes?: string[]
  images?: string[]
  shortDescription?: string
  description?: string
  shippingInfo?: ShippingInfo
}

const ProductDetails = () => {
  const { id } = useParams()
  const router = useRouter()
  const { data, isLoading, error, refetch } = useGetProductByIdQuery(id as string)
  const product: IProduct | undefined = data

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (error) {
      const msg = (error as any)?.data?.message || 'Failed to load product'
      toast.error(msg)
    }
  }, [error])

  const images = useMemo(() => {
    const imgs = product?.images && product.images.length > 0 ? product.images : []
    const thumb = product?.thumbnail ? [product.thumbnail] : []
    const merged = [...thumb.filter((u) => !!u && !imgs.includes(u as string)), ...imgs]
    return merged.length > 0 ? merged : ['/no-image.png']
  }, [product])

  const renderTitle = (field: string | { title?: string } | undefined): string => {
    if (typeof field === 'string') return field
    if (typeof field === 'object' && field?.title) return field.title
    return '-'
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Loading product...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <Card className="p-4 text-center">
        <div className="text-danger mb-2">
          <IconifyIcon icon="solar:danger-triangle-broken" className="fs-1" />
        </div>
        <h5>Product not found</h5>
        <div className="d-flex gap-2 justify-content-center mt-3">
          <button className="btn btn-outline-secondary" onClick={() => router.push('/products/product-list')}>Back to list</button>
          <button className="btn btn-primary" onClick={() => refetch()}>Retry</button>
        </div>
      </Card>
    )
  }

  return (
    <Row>
      <Col lg={4}>
        <Card>
          <CardBody>
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ minHeight: 320 }}>
              <Image src={images[activeIndex] || '/no-image.png'} alt="product image" width={500} height={500} className="img-fluid rounded" />
            </div>
            {/* Thumbnails */}
            <div className="d-flex gap-2 flex-wrap mt-3">
              {images.map((thumb, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`p-1 border rounded ${idx === activeIndex ? 'border-primary' : 'border-light'}`}
                  onClick={() => setActiveIndex(idx)}
                  title={`Image ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt={`thumb-${idx}`} style={{ width: 64, height: 64, objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="mt-4 shadow-sm">
          <CardHeader className="fw-bold bg-light border-bottom">Item Details</CardHeader>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>SKU:</strong> {product.sku || 'N/A'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Stock:</strong> {product.stock ?? 'N/A'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Brand:</strong> {renderTitle(product.brand as any)}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Weight:</strong> {product.weight ? Number(product.weight).toFixed(2) : '0.00'} kg
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Dimensions:</strong>{' '}
              {product.dimensions && (product.dimensions as any).length && (product.dimensions as any).width && (product.dimensions as any).height
                ? `${Number((product.dimensions as any).length).toFixed(2)} x ${Number((product.dimensions as any).width).toFixed(2)} x ${Number((product.dimensions as any).height).toFixed(2)} cm`
                : 'N/A'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Tags:</strong> {product.tags?.length ? product.tags.join(', ') : 'None'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Featured:</strong> {product.isFeatured ? 'Yes' : 'No'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>New Arrival:</strong> {product.isNewArrival ? 'Yes' : 'No'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Discount:</strong> {(product.discount ? Number(product.discount).toFixed(2) : '0.00') + '%'}
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>

      <Col lg={8}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Product Overview</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => router.push('/products/product-list')}>Back</button>
              <button className="btn btn-primary" onClick={() => router.push(`/products/product-edit/${product._id}`)}>Edit</button>
            </div>
          </CardHeader>
          <CardBody>
            {product.isNewArrival && <span className="badge bg-success text-light fs-14 py-1 px-2">New Arrival</span>}

            <h2 className="fs-24 text-dark fw-medium mt-2">{product.name}</h2>

            <h2 className="fw-medium my-3">
              {currency}
              {(product.price ? Number(product.price).toFixed(2) : '0.00')}{' '}
              <span className="fs-16 text-decoration-line-through">
                {currency}
                {(product.originalPrice ? Number(product.originalPrice).toFixed(2) : '0.00')}
              </span>
              <small className="text-danger ms-2">({product.discount || 0}% Off)</small>
            </h2>

            <Row className="align-items-center g-2 mt-3">
              <Col lg={6}>
                <h5 className="text-dark fw-medium">Colors</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {(product.colors || []).map((color, idx) => (
                    <span key={idx} className="badge bg-light text-dark border p-2">
                      {color}
                    </span>
                  ))}
                </div>
              </Col>

              <Col lg={6}>
                <h5 className="text-dark fw-medium">Sizes</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {(product.sizes || []).map((size, idx) => (
                    <span key={idx} className="badge bg-light text-dark border p-2">
                      {size}
                    </span>
                  ))}
                </div>
              </Col>
            </Row>

            <ul className="d-flex flex-column gap-2 list-unstyled fs-15 my-3">
              <li>
                <IconifyIcon icon="bx:check" className="text-success" /> {product.stock} In Stock
              </li>
              <li>
                <IconifyIcon icon="bx:check" className="text-success" />{' '}
                {product.shippingInfo?.freeShipping
                  ? 'Free Delivery Available'
                  : `Shipping Cost: ${currency}${product.shippingInfo?.shippingCost ? Number(product.shippingInfo.shippingCost).toFixed(2) : '0.00'}`}
              </li>
              {product.shippingInfo?.estimatedDelivery && (
                <li>
                  <IconifyIcon icon="bx:check" className="text-success" /> Estimated Delivery: <span className="text-dark fw-medium">{product.shippingInfo.estimatedDelivery}</span>
                </li>
              )}
            </ul>

            <Row className="my-3">
              <Col md={6}>
                <h5 className="text-dark fw-medium">Category</h5>
                <p className="text-muted">{renderTitle(product.category as any)}</p>
              </Col>
              <Col md={6}>
                <h5 className="text-dark fw-medium">Subcategory</h5>
                <p className="text-muted">{renderTitle(product.subcategory as any)}</p>
              </Col>
              <Col md={6}>
                <h5 className="text-dark fw-medium">Sub-Subcategory</h5>
                <p className="text-muted">{renderTitle((product as any).subSubcategory as any)}</p>
              </Col>
              <Col md={6}>
                <h5 className="text-dark fw-medium">Brand</h5>
                <p className="text-muted">{renderTitle(product.brand as any)}</p>
              </Col>
            </Row>

            {(() => {
              let entries: Array<[string, string]> = []
              const specs: any = (product as any).specifications
              if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                entries = Object.entries(specs as Record<string, string>)
              } else if (Array.isArray(specs)) {
                entries = (specs as any[])
                  .filter((i: any) => i && i.key)
                  .map((i: any) => [String(i.key), String(i.value ?? '')])
              }
              if (entries.length === 0) return null
              return (
                <>
                  <h4 className="text-dark fw-medium mt-3">Specifications</h4>
                  <ul className="list-unstyled">
                    {entries.map(([k, v], idx) => (
                      <li key={idx}>
                        <strong>{k}:</strong> {v}
                      </li>
                    ))}
                  </ul>
                </>
              )
            })()}

            {product.shortDescription && (
              <>
                <h4 className="text-dark fw-medium">Short Description</h4>
                <p className="text-muted">{product.shortDescription}</p>
              </>
            )}

            {product.description && (
              <>
                <h4 className="text-dark fw-medium">Description</h4>
                <p className="text-muted">{product.description}</p>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default ProductDetails
