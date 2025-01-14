'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const code = searchParams.get('code')
    
    // If no code is present, redirect to login
    if (!code) {
      router.push('/auth/login')
      return
    }

    // Exchange the code for a session
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Error exchanging code for session:', error)
          throw error
        }

        // Redirect to dashboard on success
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in auth callback:', error)
        // Redirect to login on error
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Confirming your email...</h2>
        <p className="text-gray-600">Please wait while we verify your account.</p>
      </div>
    </div>
  )
} 