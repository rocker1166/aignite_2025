import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const SUPPLY_CHAIN_AGENT_SYSTEM_PROMPT = `
You are Inteli a domain-specific AI agent focused exclusively on supply chain management and resilience planning.

Your purpose is to help businesses:
- Analyze supply chain disruptions
- Recommend mitigation and continuity strategies
- Optimize logistics, inventory, and node resilience
- Interpret simulation outputs (e.g. Monte Carlo runs, failure cascades)
- Plan for operational risks including geopolitical, climate, and supplier issues

Strict Rules:
1. Do NOT answer queries unrelated to supply chain topics. Respond with:
   "I'm a supply chain resilience agent. Please ask something within that domain."
2. Be concise, data-driven, and strategy-focused. Use industry terms (e.g. lead time, buffer %, throughput, disruption index).
3. Prefer structured formats (e.g., bullet points, strategy cards, or tables) when possible.
4. Reference relevant resilience metrics: cost impact, recovery time, risk score, inventory days of coverage, etc.
5. DO NOT hallucinate numbers. If real data is missing, ask the user to provide context or offer estimated ranges.

Examples of supported queries:
- "How should I prepare for a port strike in East Asia?"
- "Which nodes in my network are most at risk if factory-3 fails?"
- "Suggest 3 resilience strategies with high ROI for cold-chain logistics."

You are NOT a general-purpose chatbot. You are a specialized advisor for critical supply chain decisions.
`;

/**
 * Handles POST requests to the supply chain chat API, validating input and streaming AI-generated responses.
 *
 * Validates the request body and message format, injects a domain-specific system prompt, and streams responses from the Google Gemini AI model. Returns detailed error responses for invalid input, configuration issues, AI service errors, and rate limiting.
 *
 * @returns A streaming AI response or a JSON error response with an appropriate HTTP status code.
 */
export async function POST(req: Request) {
  console.group('🌐 Chat API Request Started')
  console.log('Request URL:', req.url)
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))
  
  try {
    // Validate request
    if (!req.body) {
      console.error("Chat API: Empty request body received")
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "REQUEST_VALIDATION_ERROR", 
          message: "Request body is required" 
        },
        { status: 400 }
      )
    }

    let messages
    try {
      const body = await req.json()
      console.log('Request body parsed:', body)
      messages = body.messages
    } catch (parseError) {
      console.error("Chat API: JSON parsing failed:", parseError)
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "JSON_PARSE_ERROR", 
          message: "Invalid JSON in request body" 
        },
        { status: 400 }
      )
    }

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Chat API: Invalid messages array:", messages)
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "MESSAGES_VALIDATION_ERROR", 
          message: "Messages array is required and must not be empty" 
        },
        { status: 400 }
      )
    }

    console.log('Messages received:', messages.length, 'messages')

    // Validate message format
    const invalidMessage = messages.find(msg => 
      !msg.role || !msg.content || 
      typeof msg.content !== 'string' ||
      !['user', 'assistant', 'system'].includes(msg.role)
    )
    
    if (invalidMessage) {
      console.error("Chat API: Invalid message format:", invalidMessage)
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "MESSAGE_FORMAT_ERROR", 
          message: "Each message must have valid role and content" 
        },
        { status: 400 }
      )
    }

    // Check for API key availability
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Chat API: Google AI API key not configured")
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "SERVICE_CONFIGURATION_ERROR", 
          message: "AI service is temporarily unavailable. Please try again later." 
        },
        { status: 503 }
      )
    }

    console.log('All validations passed, calling AI service...')

    // Attempt to call the AI service
    try {
      console.log('Creating streamText with configuration...')
      
      const result = streamText({
        model: google("gemini-2.5-pro"),
        messages: [
          { role: "system", content: SUPPLY_CHAIN_AGENT_SYSTEM_PROMPT },
          ...messages
        ],
        maxTokens: 4096,
        temperature: 0.7,
        onError: (error) => {
          console.error("Streaming error from AI service:", error)
        },
        onFinish: (result) => {
          console.log("Stream finished:", result)
        }
      })

      console.log('Stream created, converting to response...')
      
      // Create the response and add error handling
      const response = result.toDataStreamResponse()
      
      console.log('AI service call successful, returning stream')
      console.groupEnd()
      return response
      
    } catch (aiError: any) {
      console.error("Chat API: AI service error:", aiError)
      console.log("AI Error name:", aiError.name)
      console.log("AI Error message:", aiError.message)
      console.log("AI Error stack:", aiError.stack)
      console.log("AI Error cause:", aiError.cause)
      
      // Check for Google AI specific errors
      if (aiError.message?.includes('API_KEY_INVALID')) {
        console.log('Handling invalid API key error')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_API_KEY_ERROR", 
            message: "AI service configuration error. Please contact support." 
          },
          { status: 503 }
        )
      }
      
      if (aiError.message?.includes('SAFETY')) {
        console.log('Handling safety filter error')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_SAFETY_ERROR", 
            message: "Your message was blocked by safety filters. Please try rephrasing your question." 
          },
          { status: 400 }
        )
      }
      
      if (aiError.message?.includes('RECITATION')) {
        console.log('Handling recitation error')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_RECITATION_ERROR", 
            message: "Unable to generate response due to content policies. Please try a different question." 
          },
          { status: 400 }
        )
      }
      
      // Handle specific AI service errors
      if (aiError.name === 'APIConnectionError') {
        console.log('Handling APIConnectionError')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_CONNECTION_ERROR", 
            message: "Unable to connect to AI service. Please check your internet connection and try again." 
          },
          { status: 503 }
        )
      }
      
      if (aiError.name === 'RateLimitError') {
        console.log('Handling RateLimitError')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "RATE_LIMIT_ERROR", 
            message: "Too many requests. Please wait a moment and try again." 
          },
          { status: 429 }
        )
      }
      
      if (aiError.name === 'InvalidRequestError') {
        console.log('Handling InvalidRequestError')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_REQUEST_ERROR", 
            message: "Invalid request format. Please try rephrasing your question." 
          },
          { status: 400 }
        )
      }
      
      // Handle quota/billing errors
      if (aiError.message?.includes('quota') || aiError.message?.includes('billing')) {
        console.log('Handling quota/billing error')
        console.groupEnd()
        return NextResponse.json(
          { 
            error: "AI_QUOTA_ERROR", 
            message: "AI service quota exceeded. Please contact support." 
          },
          { status: 503 }
        )
      }
      
      // Log the full error for unhandled cases
      console.log('Unhandled AI error details:', {
        name: aiError.name,
        message: aiError.message,
        stack: aiError.stack,
        cause: aiError.cause,
        toString: aiError.toString()
      })
      
      // Generic AI service error with more details
      console.log('Unhandled AI error, returning generic error')
      console.groupEnd()
      return NextResponse.json(
        { 
          error: "AI_SERVICE_ERROR", 
          message: "AI service encountered an error. Please try again later.",
          details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    // Log the full error for debugging
    console.error("Chat API: Unexpected error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    })
    
    console.groupEnd()
    // Return a generic error response
    return NextResponse.json(
      { 
        error: "INTERNAL_SERVER_ERROR", 
        message: "An unexpected error occurred. Please try again later." 
      },
      { status: 500 }
    )
  }
}