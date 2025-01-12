import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  // Create an unmodified response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  try {
    // Create a Supabase client configured to use cookies
    const cookieStore = {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...options,
          sameSite: 'lax',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.delete({
          name,
          ...options,
        })
      }
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
        cookies: cookieStore
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session:', session)

    // OPTIONAL: Get user data
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('User:', user)

    // Auth routes - redirect to dashboard if logged in
    if (request.nextUrl.pathname.startsWith('/auth')) {
      console.log('Auth route, user:', !!user)
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    // Protected routes - redirect to login if not logged in
    if (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/settings')
    ) {
      console.log('Protected route, user:', !!user)
      if (!user) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    return response
  } catch (e) {
    // If there's an error, return the unmodified response
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 