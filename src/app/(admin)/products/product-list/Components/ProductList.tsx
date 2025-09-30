'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { useGetManageProductsQuery, useDeleteProductMutation } from '@/store/productsApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle } from 'react-bootstrap'
import { IProduct } from '@/store/productsApi'
import { toast } from 'react-toastify'
import { useSearchParams, useRouter } from 'next/navigation'

interface ProductRowProps extends IProduct {
  stockLeft: number
  stockSold: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const ProductRow: React.FC<ProductRowProps> = ({ _id, name, price, category, images, sizes, stockLeft, stockSold, onEdit, onDelete }) => {
  return (
    <tr>
      <td>
        <div className="form-check ms-1">
          <input type="checkbox" className="form-check-input" id={`checkbox-${_id}`} />
          <label className="form-check-label" htmlFor={`checkbox-${_id}`} />
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center overflow-hidden">
            <Image src={images?.[0] || '/no-image.png'} alt="product" width={50} height={50} objectFit="cover" className="avatar-md rounded" />
          </div>
          <div>
            <Link href={`/products/${_id}`} className="text-dark fw-medium fs-15">
              {name}
            </Link>
            <p className="text-muted mb-0 mt-1 fs-13">
              <span>Size: </span>
              {sizes?.[0] || 'N/A'}
            </p>
          </div>
        </div>
      </td>
      <td>
        {currency}
        {price.toFixed(2)}
      </td>
      <td>
        <p className="mb-1 text-muted">
          <span className="text-dark fw-medium">{stockLeft} Item</span> Left
        </p>
        <p className="mb-0 text-muted">{stockSold} Sold</p>
      </td>
      <td>{typeof category === 'object' ? category?.title : category || 'N/A'}</td>
      <td>
        <div className="d-flex gap-2">
          <Link href={`/products/${_id}`} className="btn btn-light btn-sm" title="View">
            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
          </Link>
          <button 
            onClick={() => onEdit(_id || '')} 
            className="btn btn-soft-primary btn-sm"
            title="Edit"
            disabled={!_id}
          >
            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
          </button>
          <button 
            onClick={() => onDelete(_id || '')} 
            className="btn btn-soft-danger btn-sm"
            title="Delete"
            disabled={!_id}
          >
            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
          </button>
        </div>
      </td>
    </tr>
  )
}

const ProductList: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [limit] = useState(10) // Items per page
  
  const { data, isLoading, error } = useGetManageProductsQuery({
    page: currentPage,
    limit,
    search: searchTerm || undefined,
  })
  
  const [deleteProduct] = useDeleteProductMutation()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const products = data?.products || []
  const pagination = data?.pagination

  console.log('Products Data:', data)
  console.log('Products:', products)
  console.log('Pagination:', pagination)

  const handleEdit = (id: string) => {
    // Navigate to edit page - you can implement this based on your routing
    window.location.href = `/products/product-edit/${id}`
  }

  const handleDelete = async (id: string) => {
    if (!id) return

    const confirmed = window.confirm('Are you sure you want to delete this product? This action cannot be undone.')
    
    if (!confirmed) return

    try {
      setIsDeleting(id)
      await deleteProduct(id).unwrap()
      toast.success('Product deleted successfully!')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error?.data?.message || 'Failed to delete product')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (pagination?.hasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Show success toast when redirected after creation
  useEffect(() => {
    if (searchParams?.get('created') === '1') {
      toast.success('Product created successfully!')
      router.replace('/products/product-list')
    }
    if (searchParams?.get('updated') === '1') {
      toast.success('Product updated successfully!')
      router.replace('/products/product-list')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Error indicator toast for fetch errors
  useEffect(() => {
    if (!isLoading && error) {
      const msg = (error as any)?.data?.message || 'Failed to load products'
      toast.error(msg)
    }
  }, [isLoading, error])

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading products</p>

  return (
    <Card>
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <CardTitle as="h4" className="flex-grow-1 mb-0">
            All Product List
          </CardTitle>
          <Link href="/products/product-add" className="btn btn-sm btn-primary">
            Add Product
          </Link>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control"
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <IconifyIcon icon="solar:magnifer-linear" className="align-middle fs-18" />
          </button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
            >
              Clear
            </button>
          )}
        </form>
        
        {/* Results Info */}
        {pagination && (
          <div className="mt-2">
            <small className="text-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              {searchTerm && ` for "${searchTerm}"`}
            </small>
          </div>
        )}
      </CardHeader>

      <div className="table-responsive">
        <table className="table align-middle mb-0 table-hover table-centered">
          <thead className="bg-light-subtle">
            <tr>
              <th style={{ width: 20 }}>
                <div className="form-check ms-1">
                  <input type="checkbox" className="form-check-input" id="checkAll" />
                  <label className="form-check-label" htmlFor="checkAll" />
                </div>
              </th>
              <th>Product Name & Size</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <ProductRow 
                key={product._id || idx} 
                {...product} 
                stockLeft={product.stock ?? 0} 
                stockSold={10 + idx * 5}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <CardFooter className="border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </small>
            </div>
            
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-end mb-0">
                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={handlePrevious}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </button>
                </li>
                
                {/* Page Numbers */}
                {(() => {
                  const pages = []
                  const totalPages = pagination.totalPages
                  const current = pagination.page
                  
                  // Always show first page
                  if (current > 3) {
                    pages.push(
                      <li key={1} className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(1)}>
                          1
                        </button>
                      </li>
                    )
                    if (current > 4) {
                      pages.push(
                        <li key="start-ellipsis" className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )
                    }
                  }
                  
                  // Show pages around current page
                  for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
                    pages.push(
                      <li key={i} className={`page-item ${i === current ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(i)}
                          disabled={i === current}
                        >
                          {i}
                        </button>
                      </li>
                    )
                  }
                  
                  // Always show last page
                  if (current < totalPages - 2) {
                    if (current < totalPages - 3) {
                      pages.push(
                        <li key="end-ellipsis" className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )
                    }
                    pages.push(
                      <li key={totalPages} className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                          {totalPages}
                        </button>
                      </li>
                    )
                  }
                  
                  return pages
                })()}
                
                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={handleNext}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export default ProductList
