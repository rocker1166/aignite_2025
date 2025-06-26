'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestStreamingPage() {
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStreamTest = async () => {
    setIsLoading(true);
    setStreamingResponse('');

    try {
      const response = await fetch('/api/agent/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supply_chain_id: '6470466d-8af1-4b47-ab5d-1cf214dd3389',
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            try {
              const separatorIndex = line.indexOf(':');
              if (separatorIndex === -1) {
                setStreamingResponse(prev => prev + line + '\n');
                continue;
              };

              const type = line.substring(0, separatorIndex);
              const data = line.substring(separatorIndex + 1);
              
              const parsedData = JSON.parse(data);
              const formattedJson = JSON.stringify(parsedData, null, 2);
              
              const linePrefix = `Stream Part (type ${type}):\n`;
              
              setStreamingResponse(prev => prev + linePrefix + formattedJson + '\n\n');
            } catch (e) {
              setStreamingResponse(prev => prev + line + '\n');
            }
          }
        }
      };
      
      await processStream();

    } catch (error) {
      console.error('Streaming test failed:', error);
      setStreamingResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm mb-4">
            {JSON.stringify({
              supply_chain_id: '6470466d-8af1-4b47-ab5d-1cf214dd3389',
              stream: true
            }, null, 2)}
          </pre>
          <Button onClick={handleStreamTest} disabled={isLoading}>
            {isLoading ? 'Streaming...' : 'Start Streaming Test'}
          </Button>

          {streamingResponse && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Streaming Response:</h2>
              <Card className="p-4 bg-secondary font-mono text-xs whitespace-pre-wrap">
                <code>{streamingResponse}</code>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 