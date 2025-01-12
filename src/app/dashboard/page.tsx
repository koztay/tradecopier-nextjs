'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error checking session:', error)
        router.push('/auth/login')
        return
      }

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    })

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Signed out",
        description: "Successfully signed out",
      })
      
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            You are logged in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your account is ready to start copying trades.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leader Accounts</CardTitle>
                <CardDescription>Manage your leader trading accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Add Leader Account</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Follower Accounts</CardTitle>
                <CardDescription>Manage your follower trading accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Add Follower Account</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 