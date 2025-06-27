"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useErrorHandler } from "@/components/error-boundary";
import * as Sentry from "@sentry/nextjs";

export function SentryTestComponent() {
  const [hasError, setHasError] = useState(false);
  const reportError = useErrorHandler();

  const throwClientError = () => {
    try {
      // Simulate a client-side error
      throw new Error("Test client-side error from component");
    } catch (error) {
      reportError(error as Error, "Manual error trigger from test component");
      setHasError(true);
    }
  };

  const throwRuntimeError = () => {
    // This will be caught by the Error Boundary
    throw new Error("Test runtime error that should be caught by Error Boundary");
  };

  const throwAsyncError = async () => {
    try {
      // Simulate an async error
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Test async error")), 100);
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Async error captured:", error);
      setHasError(true);
    }
  };

  const testApiError = async () => {
    try {
      const response = await fetch("/api/test-error");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      reportError(error as Error, "API call failed in test component");
      setHasError(true);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sentry Error Testing</CardTitle>
        <CardDescription>
          Test different types of errors to verify Sentry integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={throwClientError} variant="destructive" size="sm">
            Client Error
          </Button>
          <Button onClick={throwRuntimeError} variant="destructive" size="sm">
            Runtime Error
          </Button>
          <Button onClick={throwAsyncError} variant="destructive" size="sm">
            Async Error
          </Button>
          <Button onClick={testApiError} variant="destructive" size="sm">
            API Error
          </Button>
        </div>
        
        {hasError && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Error captured and sent to Sentry!
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => setHasError(false)} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}
