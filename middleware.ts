import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Add API route context to Sentry for all API calls
    Sentry.withScope((scope) => {
      scope.setTag('middleware.type', 'api_route');
      scope.setTag('api.path', request.nextUrl.pathname);
      scope.setTag('api.method', request.method);
      scope.setTag('auto_monitored', 'true');
      scope.setContext('api_request', {
        url: request.url,
        pathname: request.nextUrl.pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent') || 'unknown',
        contentType: request.headers.get('content-type') || 'unknown',
        timestamp: new Date().toISOString(),
      });
    });

    // Set up error boundary for API routes
    try {
      const response = NextResponse.next();
      
      // Tag successful API calls
      Sentry.addBreadcrumb({
        message: `API ${request.method} ${request.nextUrl.pathname}`,
        category: 'api',
        level: 'info',
        data: {
          path: request.nextUrl.pathname,
          method: request.method,
          timestamp: new Date().toISOString(),
        }
      });
      
      return response;
    } catch (error) {
      // Capture middleware-level errors
      Sentry.withScope((scope) => {
        scope.setTag('middleware.error', 'true');
        scope.setLevel('error');
        scope.setContext('middleware_error', {
          path: request.nextUrl.pathname,
          method: request.method,
          timestamp: new Date().toISOString(),
        });
        
        if (error instanceof Error) {
          scope.setContext('error_details', {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        
        Sentry.captureException(error);
      });

      console.error('[Middleware] API route error:', error);
      
      return NextResponse.json(
        { 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          path: request.nextUrl.pathname,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  }

  // For non-API routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all API routes and apply Sentry monitoring
     * - /api/* (all API routes)
     */
    '/api/:path*',
  ],
};
