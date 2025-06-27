import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalhost = Boolean(forwardedHost?.includes('localhost'));
        
        if (isLocalhost) {
          return NextResponse.redirect(`${origin}${next}`);
        } else {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
    }
  }

  // If no code or error, redirect to signin
  const redirectUrl = new URL('/signin', origin);
  redirectUrl.searchParams.set('error', 'auth_code_missing');
  redirectUrl.searchParams.set('next', next);
  return NextResponse.redirect(redirectUrl);
}
