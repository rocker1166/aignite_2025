import {
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  
  import { NextRequest } from 'next/server';
  import * as Sentry from '@sentry/nextjs';
   
  
  const serviceAdapter = new GoogleGenerativeAIAdapter({ model: "gemini-2.5-pro" });
  const runtime = new CopilotRuntime();
   
  export const POST = async (req: NextRequest) => {
    try {
      console.log("CopilotKit API request received");
      const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: '/api/copilotkit',
      });
   
      return handleRequest(req);
    } catch (error) {
      console.error('CopilotKit API error:', error);
      Sentry.captureException(error);
      throw error;
    }
  };