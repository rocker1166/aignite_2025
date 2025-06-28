import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  return { supabase, response };
};

const updateSession = async (request: NextRequest) => {
  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const { supabase, response } = createClient(request);

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Middleware - User found:', !!user, user?.id);

    // If user is authenticated, check if organization_name is empty
    if (user) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('organization_name')
        .eq('id', user.id)
        .single();

      console.log('Middleware - User data query result:', {
        userData,
        error: error?.message,
        organizationName: userData?.organization_name
      });

      if (error) {
        console.log('Middleware - Error fetching user data:', error);
      }

      if (!userData) {
        console.log('Middleware - No user row found in users table for user ID:', user.id);
      }

      // If organization_name is empty or null, redirect to profile with popup
      if (userData && (!userData.organization_name || userData.organization_name.trim() === '')) {
        console.log('Middleware - Organization name is empty, redirecting to profile');
        const url = request.nextUrl.clone();
        
        // Don't redirect if already on profile page to avoid infinite loop
        if (!url.pathname.includes('/profile')) {
          console.log('Middleware - Redirecting to profile with popup');
          url.pathname = '/profile';
          url.searchParams.set('show_popup', 'true');
          return NextResponse.redirect(url);
        } else {
          console.log('Middleware - Already on profile page, skipping redirect');
        }
      } else if (userData?.organization_name) {
        console.log('Middleware - Organization name exists:', userData.organization_name);
      }
    } else {
      console.log('Middleware - No authenticated user found');
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};

// Main middleware function for Next.js
export default async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     * - signin (signin page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|signin).*)',
  ],
}
