"use client"

import { useRef, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { MemoizedMarkdown } from '@/components/copilot/memoized-markdown';
import { MessagesAreaProps, ChatError } from './types';
import { ErrorComponent } from './ErrorComponent';

export const MessagesArea: React.FC<MessagesAreaProps> = ({ 
  messages, 
  isLoading, 
  isImmersiveMode, 
  messagesHeight,
  error,
  onRetryError,
  onDismissError,
  retryCount = 0
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10"
      style={{ height: messagesHeight }}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Welcome to AI Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              I'm here to help you with your supply chain analysis, optimization strategies, 
              and answer any questions about your network. I can also take actions like adding nodes,
              loading templates, and analyzing your current setup.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            // Don't render if message has no content
            if (!message.content || !message.content.trim()) {
              return null;
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground max-w-[75%]" 
                      : "bg-background border border-border text-foreground shadow-sm max-w-[95%]"
                  }`}
                >
                  <MemoizedMarkdown content={message.content} id={message.id} />
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
      
      {/* Error display */}
      {error && onRetryError && onDismissError && (
        <ErrorComponent 
          error={error}
          onRetry={onRetryError}
          onDismiss={onDismissError}
          retryCount={retryCount}
        />
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start pl-3">
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-75"></div>
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
          </div>
        </div>
      )}
    </div>
  );
}; 