import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    
    // Enable automatic API route error capture
    console.log('🔧 Sentry server instrumentation loaded with auto API route monitoring');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
    
    // Enable automatic edge API route error capture
    console.log('🔧 Sentry edge instrumentation loaded with auto API route monitoring');
  }
}

// Automatically capture all request errors including API routes
export const onRequestError = Sentry.captureRequestError;
