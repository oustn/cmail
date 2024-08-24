import { NextRequest, NextResponse } from 'next/server'

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(request: NextRequest) {
    // Handle preflighted requests
    const isPreflight = request.method === 'OPTIONS'

    if (isPreflight) {
        const preflightHeaders = {
            ...{ 'Access-Control-Allow-Origin': '*' },
            ...corsOptions,
        }
        return NextResponse.json({}, { headers: preflightHeaders })
    }

    // Handler Turnstile
    if (request.nextUrl.pathname.startsWith('/api/mails')) {
        const auth = request.headers.get('Authorization')
        if (!auth) {
            return NextResponse.json({
                error: "Missing Authorization header"
            }, {
                status: 401
            })
        }
    }

    // Handle simple requests
    const response = NextResponse.next()

    response.headers.set('Access-Control-Allow-Origin', '*')

    Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

export const config = {
    matcher: '/api/:path*',
}
