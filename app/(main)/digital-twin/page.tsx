"use client";
// src/pages/DigitalTwinPage.tsx
import { Suspense } from 'react';
import DigitalTwinClientPage from './digital-twin-client-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function DigitalTwinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-12 w-96 mx-auto bg-muted" />
            <Skeleton className="h-6 w-64 mx-auto bg-muted" />
          </div>
          <Skeleton className="h-96 w-full bg-muted" />
        </div>
      </div>
    }>
      <DigitalTwinClientPage />
    </Suspense>
  );
}