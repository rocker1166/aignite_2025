import { tavily } from '@tavily/core';
import { NextRequest, NextResponse } from 'next/server';
import { withSentry } from '@/lib/utils/sentry-utils';
import * as Sentry from '@sentry/nextjs'

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY
});

export const POST = withSentry(async (req: NextRequest) => {
  try {
    const { query } = await req.json();

    if (!query) {
      const validationError = new Error('Query is required');
      Sentry.captureException(validationError);
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const searchResult = await tavilyClient.search(query, {
      searchDepth: "advanced",
      includeAnswer: true,
      maxResults: 5,
    });

    return NextResponse.json(searchResult);
  } catch (error) {
    console.error('Search API error:', error);
    Sentry.captureException(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to perform search', details: errorMessage }, { status: 500 });
  }
}); 