import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wraps API route handlers with automatic Sentry error reporting
 * Usage: export const GET = withSentry(async (req) => { ... });
 */
export function withSentry(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      // Capture the error with Sentry
      Sentry.withScope((scope) => {
        scope.setTag("api_route", req.nextUrl.pathname);
        scope.setContext("request", {
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        });
        scope.setLevel("error");
        Sentry.captureException(error);
      });

      // Log the error for debugging
      console.error(`API Error in ${req.nextUrl.pathname}:`, error);

      // Return error response
      return NextResponse.json(
        { 
          error: "Internal Server Error",
          message: process.env.NODE_ENV === "development" ? (error as Error).message : "Something went wrong"
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Manually report an error to Sentry from within an API route
 */
export function reportApiError(error: Error, context: {
  route: string;
  method: string;
  userId?: string;
  additionalContext?: Record<string, any>;
}) {
  Sentry.withScope((scope) => {
    scope.setTag("api_route", context.route);
    scope.setTag("method", context.method);
    
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context.additionalContext) {
      scope.setContext("additional", context.additionalContext);
    }
    
    scope.setLevel("error");
    Sentry.captureException(error);
  });
  
  console.error(`Manual API error report for ${context.route}:`, error);
}
