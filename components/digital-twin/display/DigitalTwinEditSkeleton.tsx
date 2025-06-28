import { Skeleton } from "@/components/ui/skeleton";

export default function DigitalTwinEditSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Editor Mode: Builder Panel */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-6 w-48 mb-2 bg-muted" />
              <Skeleton className="h-4 w-64 bg-muted" />
          </div>
          
          {/* Add Nodes Section */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-5 w-24 mb-4 bg-muted" />
              <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                      <Skeleton className="h-8 w-8 rounded bg-muted" />
                      <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1 bg-muted" />
                      <Skeleton className="h-3 w-32 bg-muted" />
                      </div>
                  </div>
                  ))}
              </div>
          </div>
          
          {/* Templates Section */}
          <div className="p-4 flex-1">
              <Skeleton className="h-5 w-20 mb-4 bg-muted" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-4 w-28 bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
              </div>
          </div>
          
          {/* Clear Button */}
          <div className="p-4 border-t border-border">
              <Skeleton className="h-10 w-full rounded bg-muted" />
          </div>
      </div>

      {/* Main Canvas Area Skeleton */}
      <div className="flex-1 relative bg-background">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
            <Skeleton className="h-10 w-10 rounded bg-muted" />
            <Skeleton className="h-10 w-10 rounded bg-muted" />
            <Skeleton className="h-10 w-10 rounded bg-muted" />
            <Skeleton className="h-10 w-10 rounded bg-muted" />
        </div>
        
        {/* Mock Nodes in Canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-3/4 h-1/2">
                <Skeleton className="absolute top-[20%] left-[10%] h-16 w-32 rounded-lg bg-muted" />
                <Skeleton className="absolute top-[50%] left-[30%] h-16 w-32 rounded-lg bg-muted" />
                <Skeleton className="absolute top-[30%] left-[60%] h-16 w-32 rounded-lg bg-muted" />
                <Skeleton className="absolute top-[60%] left-[80%] h-16 w-32 rounded-lg bg-muted" />
                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 -translate-x-1/2 -translate-y-1/2">
                    <Skeleton className="h-full w-full bg-muted"/>
                </div>
            </div>
        </div>
        
        {/* Mini Map */}
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-card border border-border rounded-lg shadow-sm p-2">
            <Skeleton className="h-full w-full bg-muted" />
        </div>
      </div>

      {/* Editor Mode: Full properties panel */}
      <div className="w-80 bg-card border-l border-border flex flex-col relative">
          {/* Save Button */}
          <div className="absolute top-4 right-4 z-10">
              <Skeleton className="h-12 w-20 rounded-md bg-blue-100 dark:bg-blue-900" />
          </div>
          
          {/* Header */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-6 w-24 mb-2 bg-muted" />
              <Skeleton className="h-4 w-32 bg-muted" />
          </div>
          
          {/* Node Type Section */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-5 w-20 mb-3 bg-muted" />
              <Skeleton className="h-8 w-24 rounded bg-muted" />
          </div>
          
          {/* General Section */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-5 w-16 mb-3 bg-muted" />
              <div className="space-y-3">
                  <div>
                      <Skeleton className="h-4 w-12 mb-1 bg-muted" />
                      <Skeleton className="h-9 w-full rounded bg-muted" />
                  </div>
                  <div>
                      <Skeleton className="h-4 w-20 mb-1 bg-muted" />
                      <Skeleton className="h-20 w-full rounded bg-muted" />
                  </div>
              </div>
          </div>
          
          {/* Additional Sections */}
          <div className="p-4 border-b border-border">
              <Skeleton className="h-5 w-28 mb-3 bg-muted" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-auto p-4 border-t border-border">
              <Skeleton className="h-10 w-full rounded mb-2 bg-muted" />
              <Skeleton className="h-10 w-full rounded bg-muted" />
          </div>
      </div>
    </div>
  );
} 