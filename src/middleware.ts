import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS for all requests
  const response = request.nextUrl.pathname === '/' ? NextResponse.redirect(new URL('/dashboard', request.url)) : NextResponse.next()

  // // Add CORS headers
  // response.headers.set('Access-Control-Allow-Origin', '*')
  // response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  // response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role')
  // response.headers.set('Access-Control-Allow-Credentials', 'true')

  // // Handle preflight requests
  // if (request.method === 'OPTIONS') {
  //   return new Response(null, {
  //     status: 200,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  //       'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Role',
  //       'Access-Control-Allow-Credentials': 'true',
  //     },
  //   })
  // }

  return response
}

// Apply middleware to all routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export { default } from 'next-auth/middleware'
