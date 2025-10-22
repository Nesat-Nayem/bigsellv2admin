import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://api.atpuae.com/v1/api'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'DELETE')
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, 'PATCH')
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

    // Get headers from original request
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Skip host and other headers that shouldn't be forwarded
      if (!['host', 'connection', 'accept-encoding'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })

    // Set content-type for requests with body
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')
      if (contentType) {
        headers['content-type'] = contentType
      }
    }

    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('multipart/form-data')) {
        body = await request.formData()
      } else if (contentType?.includes('application/json')) {
        try {
          const textBody = await request.text()
          body = textBody
        } catch (error) {
          console.error('Error reading JSON body:', error)
        }
      } else {
        try {
          body = await request.text()
        } catch (error) {
          console.error('Error reading request body:', error)
        }
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body as any,
    })

    const responseData = await response.text()
    
    // Create response with CORS headers
    const corsResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    })

    // Copy response headers
    response.headers.forEach((value, key) => {
      corsResponse.headers.set(key, value)
    })

    // Add CORS headers
    corsResponse.headers.set('Access-Control-Allow-Origin', '*')
    corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role')
    corsResponse.headers.set('Access-Control-Allow-Credentials', 'true')

    return corsResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role',
        }
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
