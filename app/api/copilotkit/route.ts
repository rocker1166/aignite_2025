import {
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  
  import { NextRequest } from 'next/server';
   
  
  const serviceAdapter = new GoogleGenerativeAIAdapter({ model: "gemini-2.0-flash-lite" });
  const runtime = new CopilotRuntime();
   
  export const POST = async (req: NextRequest) => {
    // console.log("CopilotKit API request received");
    // console.log(req);
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });
   
    return handleRequest(req);
  };