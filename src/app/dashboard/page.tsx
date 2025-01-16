'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ConnectMT5Account } from '@/components/mt5/connect-account'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [leaderAccounts, setLeaderAccounts] = useState<any[]>([])
  const [followerAccounts, setFollowerAccounts] = useState<any[]>([])

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
      loadAccounts(session.user.id)
      setLoading(false)
    })

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      loadAccounts(session.user.id)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadAccounts = async (userId: string) => {
    try {
      // Load leader accounts
      const { data: leaders, error: leaderError } = await supabase
        .from('Leader')
        .select('*')
        .eq('userId', userId)
        .eq('isActive', true);

      if (leaderError) throw leaderError;
      setLeaderAccounts(leaders || []);

      // Load follower accounts
      const { data: followers, error: followerError } = await supabase
        .from('Follower')
        .select('*')
        .eq('userId', userId)
        .eq('isActive', true);

      if (followerError) throw followerError;
      setFollowerAccounts(followers || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load trading accounts",
        variant: "destructive",
      });
    }
  };

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
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leader Accounts</CardTitle>
            <CardDescription>Accounts that other traders can copy from</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderAccounts.length > 0 ? (
              <div className="space-y-4">
                {leaderAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">Account ID: {account.accountId}</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No leader accounts connected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follower Accounts</CardTitle>
            <CardDescription>Accounts that copy trades from leaders</CardDescription>
          </CardHeader>
          <CardContent>
            {followerAccounts.length > 0 ? (
              <div className="space-y-4">
                {followerAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">Account ID: {account.accountId}</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No follower accounts connected yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <ConnectMT5Account />
        </div>
      </div>
    </div>
  )
} 