import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormData {
  login: string;
  password: string;
  server: string;
  platform: 'MT4' | 'MT5';
  accountType: 'leader' | 'follower';
}

export function ConnectMT5Account() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    login: '',
    password: '',
    server: '',
    platform: 'MT5',
    accountType: 'leader'
  });
  const { toast } = useToast();
  const router = useRouter();

  const validateForm = (): boolean => {
    // Login should be a number
    if (!/^\d+$/.test(formData.login)) {
      toast({
        title: 'Invalid Login',
        description: 'Account login must be a number',
        variant: 'destructive',
      });
      return false;
    }

    // Password should be at least 8 characters
    if (formData.password.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return false;
    }

    // Server name validation
    if (!/^[A-Za-z0-9-]+$/.test(formData.server)) {
      toast({
        title: 'Invalid Server',
        description: 'Server name can only contain letters, numbers, and hyphens',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect account');
      }

      toast({
        title: 'Success',
        description: `${formData.platform} account connected successfully`,
      });

      // Refresh the page to show the new account
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Trading Account</CardTitle>
        <CardDescription>
          Connect your MetaTrader account through MetaAPI to start copy trading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Type</Label>
            <Select
              value={formData.platform}
              onValueChange={(value: 'MT4' | 'MT5') => handleInputChange('platform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MT4">MetaTrader 4</SelectItem>
                <SelectItem value="MT5">MetaTrader 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login">Account Login</Label>
            <Input
              id="login"
              type="number"
              placeholder="Enter your trading account login"
              value={formData.login}
              onChange={(e) => handleInputChange('login', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Account Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your trading account password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server">Server Name</Label>
            <Input
              id="server"
              placeholder="Enter your broker's server name (e.g., ICMarketsSC-Demo)"
              value={formData.server}
              onChange={(e) => handleInputChange('server', e.target.value)}
              required
              pattern="[A-Za-z0-9-]+"
              title="Server name can only contain letters, numbers, and hyphens"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup
              value={formData.accountType}
              onValueChange={(value: 'leader' | 'follower') => handleInputChange('accountType', value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="leader" id="leader" />
                <Label htmlFor="leader">Leader Account (Copy From)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="follower" id="follower" />
                <Label htmlFor="follower">Follower Account (Copy To)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 