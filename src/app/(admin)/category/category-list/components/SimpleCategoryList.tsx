'use client'

import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Col, 
  Row, 
  Spinner, 
  Alert, 
  Button, 
  Table 
} from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetCategoriesQuery } from '@/store/productCategoryApi'

const SimpleCategoryList = () => {
  const [attempt, setAttempt] = useState(0)
  
  // Try different API call patterns based on attempt
  const apiParams = attempt === 0 ? undefined : { page: 1, limit: 50 }
  
  const { data: categories = [], isLoading, isError, error, refetch } = useGetCategoriesQuery(apiParams)

  console.log('SimpleCategoryList - API Response:', {
    categories,
    isLoading,
    isError,
    error,
    attempt,
    apiParams
  })

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading categories...</p>
              <small className="text-muted">Attempt: {attempt + 1}</small>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (isError) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <Alert variant="danger">
                <IconifyIcon icon="solar:danger-circle-broken" className="me-2" />
                <strong>Failed to load categories</strong>
                
                {error && (
                  <div className="mt-3">
                    <details>
                      <summary className="btn btn-sm btn-outline-danger">View Error Details</summary>
                      <pre className="mt-2 small">{JSON.stringify(error, null, 2)}</pre>
                    </details>
                  </div>
                )}
                
                <div className="mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="me-2"
                    onClick={() => refetch()}
                  >
                    <IconifyIcon icon="solar:refresh-broken" className="me-1" />
                    Retry Same Request
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      setAttempt(prev => prev + 1)
                      setTimeout(() => refetch(), 100)
                    }}
                  >
                    <IconifyIcon icon="solar:settings-broken" className="me-1" />
                    Try Different Parameters
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    className="ms-2"
                    onClick={() => {
                      // Test direct API call
                      fetch('http://localhost:8080/v1/api/productsCategory')
                        .then(res => {
                          console.log('Direct API Response Status:', res.status)
                          return res.json()
                        })
                        .then(data => {
                          console.log('Direct API Response Data:', data)
                          alert('Check console for direct API response')
                        })
                        .catch(err => {
                          console.error('Direct API Error:', err)
                          alert('Direct API failed: ' + err.message)
                        })
                    }}
                  >
                    Test Direct API
                  </Button>
                </div>
              </Alert>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as={'h4'}>
              Categories ({categories.length})
            </CardTitle>
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-secondary" onClick={() => refetch()}>
                <IconifyIcon icon="solar:refresh-broken" className="me-1" />
                Refresh
              </Button>
              <Link href="/category/category-add" className="btn btn-sm btn-primary">
                <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                Add Category
              </Link>
            </div>
          </CardHeader>

          <CardBody>
            {categories.length === 0 ? (
              <Alert variant="info" className="text-center">
                <IconifyIcon icon="solar:folder-broken" className="fs-48 mb-3" />
                <h5>No Categories Found</h5>
                <p>You haven&apos;t created any categories yet.</p>
                <Link href="/category/category-add" className="btn btn-primary">
                  <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                  Create First Category
                </Link>
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category: any) => (
                      <tr key={category._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-light rounded p-2">
                              <IconifyIcon 
                                icon={category.icon || 'solar:folder-broken'} 
                                className="fs-20 text-muted" 
                              />
                            </div>
                            <div>
                              <strong>{category.title}</strong>
                              {category.slug && (
                                <div className="small text-muted">{category.slug}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">
                            {category.description 
                              ? category.description.length > 50 
                                ? `${category.description.substring(0, 50)}...`
                                : category.description
                              : '-'
                            }
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            Level {category.level || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${category.isActive !== false ? 'bg-success' : 'bg-danger'}`}>
                            {category.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link 
                              href={`/category/category-view/${category._id}`} 
                              className="btn btn-sm btn-outline-info"
                            >
                              <IconifyIcon icon="solar:eye-broken" />
                            </Link>
                            <Link 
                              href={`/category/category-edit/${category._id}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <IconifyIcon icon="solar:pen-2-broken" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default SimpleCategoryList
