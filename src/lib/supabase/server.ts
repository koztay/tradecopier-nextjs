import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set({
            name,
            value,
            ...options,
            path: options.path ?? '/',
            sameSite: options.sameSite ?? 'lax',
            httpOnly: options.httpOnly ?? true,
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name: string, options: CookieOptions) {
          cookies().delete({
            name,
            path: options.path ?? '/',
          })
        },
      },
    }
  )
}

export async function getServerSession() {
  const supabase = createClient()
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    return null
  }
} 