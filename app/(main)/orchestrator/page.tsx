'use client'

import { Suspense } from 'react'
import DynamicOrchestratorPage from '@/components/orchestrator/dynamic-orchestrator-page'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrchestratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen  text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-12 w-96 mx-auto bg-slate-700" />
            <Skeleton className="h-6 w-64 mx-auto bg-slate-700" />
          </div>
          <Skeleton className="h-96 w-full bg-slate-700" />
        </div>
      </div>
    }>
      <DynamicOrchestratorPage />
    </Suspense>
  )
}
