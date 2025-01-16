import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
const MetaApi = require('metaapi.cloud-sdk').default;

export interface MT5AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
}

export interface ConnectionOptions {
  login: string;
  password: string;
  server: string;
  platform: 'MT4' | 'MT5';
  userId: string;
}

export class MT5Client {
  private api: any;
  private connection: any | null = null;
  private supabase: any;

  constructor(token: string) {
    if (!token) {
      throw new Error('META_API_TOKEN is required');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    this.api = new MetaApi(token);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async storeAccountInfo(accountId: string, options: ConnectionOptions, accountInfo: MT5AccountInfo) {
    try {
      const { error: storeError } = await this.supabase
        .from('mt_accounts')
        .upsert({
          user_id: options.userId,
          account_id: accountId,
          login: options.login,
          server: options.server,
          platform: options.platform,
          balance: accountInfo.balance,
          equity: accountInfo.equity,
          margin: accountInfo.margin,
          free_margin: accountInfo.freeMargin,
          leverage: accountInfo.leverage,
          currency: accountInfo.currency,
          last_connected: new Date().toISOString()
        });

      if (storeError) {
        console.error('Failed to store account info:', storeError);
        return false;
      }

      return true;
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error storing account info:', err.message);
      }
      return false;
    }
  }

  async connect(options: ConnectionOptions): Promise<boolean> {
    try {
      console.log('Checking for existing accounts...');
      
      const response = await axios.get(
        'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts',
        {
          headers: {
            'auth-token': process.env.META_API_TOKEN
          }
        }
      );
      
      const accounts = response.data;
      console.log(`Found ${accounts.length} accounts`);
      
      let account = accounts.find((acc: any) => 
        acc.login === options.login && 
        acc.state === 'DEPLOYED'
      );

      if (!account) {
        console.log('No deployed account found with login:', options.login);
        return false;
      }

      console.log('Using existing account, ID:', account._id);

      const metaApiAccount = await this.api.metatraderAccountApi.getAccount(account._id);

      console.log('Connecting to broker...');
      this.connection = metaApiAccount.getStreamingConnection();
      await this.connection.connect();

      console.log('Waiting for synchronization...');
      await this.connection.waitSynchronized();
      
      try {
        const accountInfo = await this.getAccountInfo();
        console.log('Initial account info retrieved:', accountInfo);

        const stored = await this.storeAccountInfo(account._id, options, accountInfo);
        if (!stored) {
          console.warn('Failed to store account info, but connection is still valid');
        }

      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Failed to get account info:', err.message);
          throw err;
        }
      }

      console.log(`Successfully connected to ${options.platform}`);
      return true;

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Connection error:', err.message);
      }
      if (this.connection) {
        try {
          await this.disconnect();
        } catch (disconnectErr: unknown) {
          if (disconnectErr instanceof Error) {
            console.error('Error during disconnect:', disconnectErr.message);
          }
        }
      }
      return false;
    }
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    await this.connection.waitSynchronized();

    const accountInfo = this.connection.terminalState.accountInformation;
    if (!accountInfo) {
      throw new Error('Account information not available');
    }

    const info: MT5AccountInfo = {
      balance: accountInfo.balance,
      equity: accountInfo.equity,
      margin: accountInfo.margin,
      freeMargin: accountInfo.freeMargin,
      leverage: accountInfo.leverage,
      currency: accountInfo.currency
    };

    return info;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log('Disconnected from trading account');
    }
  }
}

let mt5ClientInstance: MT5Client | null = null;

export function getMT5Client(): MT5Client {
  if (!mt5ClientInstance && !process.env.META_API_TOKEN) {
    throw new Error('META_API_TOKEN environment variable is required');
  }
  
  if (!mt5ClientInstance) {
    mt5ClientInstance = new MT5Client(process.env.META_API_TOKEN!);
  }
  
  return mt5ClientInstance;
} 