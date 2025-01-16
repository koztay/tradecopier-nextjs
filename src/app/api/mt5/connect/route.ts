import { NextResponse } from 'next/server';
import { getMT5Client } from '@/lib/mt5/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { login, password, server, platform } = body;

    if (!login || !password || !server || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const client = getMT5Client();
      const connected = await client.connect({
        login,
        password,
        server,
        platform,
        userId: user.id
      });

      if (!connected) {
        return NextResponse.json(
          { error: 'Failed to connect to trading account' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('MT5 client error:', err);
      if (err instanceof Error) {
        return NextResponse.json(
          { error: err.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to initialize MT5 client' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 