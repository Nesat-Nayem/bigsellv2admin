'use client'

import React from 'react'
import { Card, CardBody, CardHeader, Alert, Button, Spinner } from 'react-bootstrap'
import { useGetCategoriesQuery } from '@/store/productCategoryApi'

const TestCategories = () => {
  // Test different API call patterns
  const { 
    data: categoriesWithParams, 
    isLoading: loading1, 
    isError: error1, 
    error: errorDetails1 
  } = useGetCategoriesQuery({ page: 1, limit: 10 })

  const { 
    data: categoriesWithoutParams, 
    isLoading: loading2, 
    isError: error2, 
    error: errorDetails2 
  } = useGetCategoriesQuery()

  return (
    <div className="container py-4">
      <h2>Category API Test</h2>
      
      {/* Test with parameters */}
      <Card className="mb-4">
        <CardHeader>
          <h5>Test with parameters (page: 1, limit: 10)</h5>
        </CardHeader>
        <CardBody>
          {loading1 && <Spinner animation="border" />}
          
          {error1 && (
            <Alert variant="danger">
              <strong>Error occurred:</strong>
              <pre>{JSON.stringify(errorDetails1, null, 2)}</pre>
            </Alert>
          )}
          
          {!loading1 && !error1 && (
            <div>
              <p><strong>Success!</strong> Found {categoriesWithParams?.length || 0} categories</p>
              <pre>{JSON.stringify(categoriesWithParams, null, 2)}</pre>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Test without parameters */}
      <Card className="mb-4">
        <CardHeader>
          <h5>Test without parameters</h5>
        </CardHeader>
        <CardBody>
          {loading2 && <Spinner animation="border" />}
          
          {error2 && (
            <Alert variant="danger">
              <strong>Error occurred:</strong>
              <pre>{JSON.stringify(errorDetails2, null, 2)}</pre>
            </Alert>
          )}
          
          {!loading2 && !error2 && (
            <div>
              <p><strong>Success!</strong> Found {categoriesWithoutParams?.length || 0} categories</p>
              <pre>{JSON.stringify(categoriesWithoutParams, null, 2)}</pre>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Manual API Test */}
      <Card>
        <CardHeader>
          <h5>Manual API Test</h5>
        </CardHeader>
        <CardBody>
          <Button 
            onClick={() => {
              fetch('https://api.bigsell.org/v1/api/productsCategory')
                .then(res => res.json())
                .then(data => {
                  console.log('Manual API Response:', data)
                  alert('Check console for response')
                })
                .catch(err => {
                  console.error('Manual API Error:', err)
                  alert('Error: ' + err.message)
                })
            }}
          >
            Test API Directly
          </Button>
          
          <Button 
            className="ms-2"
            onClick={() => {
              // Check auth token
              const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
              console.log('Current auth token:', token)
              alert('Check console for auth token')
            }}
          >
            Check Auth Token
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

export default TestCategories
