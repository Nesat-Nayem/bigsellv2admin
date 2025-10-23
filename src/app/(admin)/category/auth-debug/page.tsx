'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Alert, Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const AuthDebug = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const [apiTest, setApiTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('Current Auth State:', auth)
  }, [auth])

  const testAPI = async () => {
    setLoading(true)
    setApiTest(null)

    try {
      // Test 1: Direct fetch with token
      const token = auth.token || localStorage.getItem('token')

      const response = await fetch('http://api.atpuae.com/productsCategory', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(auth.user?.role && { 'X-User-Role': auth.user.role }),
        },
      })

      const data = await response.json()

      setApiTest({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: response.headers,
        ok: response.ok,
      })

      console.log('API Test Result:', {
        status: response.status,
        data: data,
        token: token ? 'Present' : 'Missing',
      })
    } catch (error) {
      setApiTest({
        error: error,
        message: (error as Error).message,
      })
      console.error('API Test Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h2>Authentication & API Debug</h2>

      {/* Auth State */}
      <Card className="mb-4">
        <CardHeader>
          <h5>Redux Auth State</h5>
        </CardHeader>
        <CardBody>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>
                  <strong>Is Authenticated</strong>
                </td>
                <td>{auth.isAuthenticated ? '✅ Yes' : '❌ No'}</td>
              </tr>
              <tr>
                <td>
                  <strong>Token Present</strong>
                </td>
                <td>{auth.token ? '✅ Yes' : '❌ No'}</td>
              </tr>
              <tr>
                <td>
                  <strong>Token (First 20 chars)</strong>
                </td>
                <td>
                  <code>{auth.token ? auth.token.substring(0, 20) + '...' : 'null'}</code>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>User</strong>
                </td>
                <td>{auth.user ? JSON.stringify(auth.user, null, 2) : 'null'}</td>
              </tr>
              <tr>
                <td>
                  <strong>User Role</strong>
                </td>
                <td>
                  <code>{auth.user?.role || 'Not set'}</code>
                </td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* LocalStorage Check */}
      <Card className="mb-4">
        <CardHeader>
          <h5>LocalStorage Check</h5>
        </CardHeader>
        <CardBody>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>
                  <strong>localStorage.token</strong>
                </td>
                <td>
                  <code>
                    {typeof window !== 'undefined' ? localStorage.getItem('token')?.substring(0, 20) + '...' || 'Not found' : 'Server side'}
                  </code>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>localStorage.user</strong>
                </td>
                <td>
                  <pre className="small">{typeof window !== 'undefined' ? localStorage.getItem('user') || 'Not found' : 'Server side'}</pre>
                </td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* API Test */}
      <Card className="mb-4">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5>API Test</h5>
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Category API'}
          </Button>
        </CardHeader>
        <CardBody>
          {!apiTest && !loading && <Alert variant="info">Click &quot;Test Category API&quot; to test the API with current auth token</Alert>}

          {loading && <Alert variant="info">Testing API...</Alert>}

          {apiTest && (
            <div>
              {apiTest.error ? (
                <Alert variant="danger">
                  <strong>API Error:</strong>
                  <pre>{JSON.stringify(apiTest, null, 2)}</pre>
                </Alert>
              ) : (
                <div>
                  <Alert variant={apiTest.ok ? 'success' : 'danger'}>
                    <strong>Status:</strong> {apiTest.status} {apiTest.statusText}
                  </Alert>

                  <div className="mt-3">
                    <h6>Response Data:</h6>
                    <pre className="bg-light p-3 rounded small" style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {JSON.stringify(apiTest.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h5>Quick Actions</h5>
        </CardHeader>
        <CardBody>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => {
                console.log('Full Auth State:', auth)
                console.log('LocalStorage Token:', localStorage.getItem('token'))
                console.log('LocalStorage User:', localStorage.getItem('user'))
                alert('Check console for detailed auth info')
              }}>
              Log Auth Details
            </Button>

            <Button
              variant="outline-warning"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}>
              Clear Storage & Reload
            </Button>

            <Button variant="outline-secondary" onClick={() => (window.location.href = '/category/category-list')}>
              Go to Category List
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AuthDebug
