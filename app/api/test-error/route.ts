import { NextResponse } from 'next/server';
import { withSentry } from '@/lib/utils/sentry-utils';

// Test API route that intentionally throws an error
export const GET = withSentry(async (req) => {
  // Simulate different types of errors
  const errorType = req.nextUrl.searchParams.get('type') || 'generic';
  
  switch (errorType) {
    case 'database':
      throw new Error('Database connection failed');
    case 'validation':
      throw new Error('Invalid request parameters');
    case 'auth':
      throw new Error('Unauthorized access');
    case 'timeout':
      // Simulate a timeout error
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw new Error('Request timeout');
    default:
      throw new Error('Generic server error for testing');
  }
});

export const POST = withSentry(async (req) => {
  const body = await req.json();
  
  // Simulate a validation error
  if (!body.test) {
    throw new Error('Missing required field: test');
  }
  
  return NextResponse.json({ success: true, message: 'Test passed' });
});
