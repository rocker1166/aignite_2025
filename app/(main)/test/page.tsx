'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemoizedMarkdown } from '@/components/copilot/memoized-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AILoadingState from '@/components/ui/ai-loading-state';
import { Card as AnimatedCard } from '@/components/ui/animated-card';
import { cn } from '@/lib/utils';

function SuccessRedirect() {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard');
      return;
    }

    const timerId = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown, router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="text-center flex-grow flex flex-col justify-center items-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-semibold text-gray-800">
          Analysis Complete
        </h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          We have successfully analyzed your supply chain. You can wait to be
          redirected, or go back to the dashboard now.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Redirecting to Dashboard in {countdown}...
        </p>
      </div>
      <div className="pt-4 mt-4 w-full">
        <Button
          onClick={handleGoToDashboard}
          className="w-full shadow-md"
          variant="secondary"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function TestStreamingPage() {
  const supplyChainId = '6470466d-8af1-4b47-ab5d-1cf214dd3389';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { messages, append, setMessages, isLoading, error } = useChat({
    api: '/api/agent/info',
    body: {
      supply_chain_id: supplyChainId,
      stream: true,
    },
    id: `test-intel-${supplyChainId}`,
    onFinish: () => {
      setShowSuccess(true);
    },
  });

  const handleStreamTest = async () => {
    setMessages([]);
    setShowSuccess(false);
    setIsDialogOpen(true);
    await append({
      role: 'user',
      content: `Please provide a comprehensive intelligence analysis for supply chain ID ${supplyChainId}.`,
    });
  };

  const assistantMessages = messages.filter(m => m.role === 'assistant');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Streaming Test Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Test `/api/agent/info`</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to see the raw, formatted JSON stream from the API in real-time.
          </p>
          <Button onClick={handleStreamTest} disabled={isLoading} className="shadow-md">
            {isLoading ? 'Streaming...' : 'Start Streaming Test'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={cn(
            'max-w-xl transition-all duration-300 ',
            (isLoading || showSuccess) && 'p-0 bg-transparent border-0',
          )}
        >
          <AnimatedCard
            variant={isLoading || showSuccess ? 'animated-border' : 'default'}
            className="w-full max-w-none"
          >
            <div className="p-6 min-h-[400px] flex">
              {showSuccess ? (
                <SuccessRedirect />
              ) : isLoading ? (
                <AILoadingState
                  content={assistantMessages.map(m => m.content).join('\n')}
                />
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Streaming Response</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {/* This area is now for pre-stream content if any, or just the title */}
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-500 mt-4">
                  Error: {error.message}
                </div>
              )}
            </div>
          </AnimatedCard>
        </DialogContent>
      </Dialog>
    </div>
  );
} 