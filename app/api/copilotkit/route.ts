import {
    CopilotRuntime,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  
  import { NextRequest } from 'next/server';
   
  const model = process.env.COPILOT_KIT_MODEL || "gemini-2.5-flash";
  const serviceAdapter = new GoogleGenerativeAIAdapter({ model: model });
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