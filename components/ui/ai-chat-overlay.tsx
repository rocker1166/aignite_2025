"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Cpu, Paperclip, Mic, CornerDownLeft, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"

function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [inputValue, setInputValue] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    initialMessages: [{ id: "1", role: "assistant", content: "Hello! How can I assist you today?" }],
  })

  // Measure the input element to animate from
  useEffect(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect()
      setPosition({ x: rect.left, y: rect.top })
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  const handleOpen = () => {
    // Update position right before animation
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      setDimensions({ width: rect.width, height: rect.height });
    }

    setIsAnimating(true);
    setIsOpen(true);

    // Add the input value as the first user message and submit if not empty
    if (inputValue.trim() !== "") {
      append({ content: inputValue, role: "user" });
      setInputValue("");
    }
  };

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== "") {
      e.preventDefault()
      handleOpen()
    }
  }

  const onSubmitChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    }
  }, [isOpen])

  return (
    <>
      {!isOpen && (
        <div className="sticky bottom-6 mx-auto w-full max-w-2xl  px-6 z-10">
          <div 
            ref={inputContainerRef} 
            className="flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#0F172A]/80 p-2 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-[#4ADE80]/20 hover:border-[#4ADE80]/50"
          >
            <button
              type="button"
              onClick={handleOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4ADE80] relative group"
              aria-label="Open Chatbot"
            >
              <Cpu className="h-4 w-4 text-[#0F172A]" />
              <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-[#1E293B] text-white text-xs rounded-md px-2 py-1 shadow-lg">
                Open Chatbot
              </span>
            </button>
            <Input
              value={inputValue}
              onChange={handleLocalInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI: 'What if my top supplier in Taiwan fails?'"
              className="h-8 flex-1 border-0 bg-transparent text-white placeholder:text-[#94A3B8] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="sm"
              className="h-8 rounded-full bg-[#1E293B] px-3 text-[#4ADE80] hover:bg-[#1E293B]/80 transition-colors duration-200"
              onClick={handleOpen}
              disabled={inputValue.trim() === ""}
            >
              Ask
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
            {
              "opacity-0": isAnimating && !isOpen,
              "opacity-100": !(isAnimating && !isOpen)
            }
          )}
        >
          <div
            ref={modalRef}
            style={{
              transformOrigin: "bottom center",
              transform: isAnimating && isOpen ? 'scale(1)' : `translate(${position.x}px, ${position.y}px) scale(0.5)`,
              width: isAnimating && isOpen ? '100%' : `${dimensions.width}px`,
              height: isAnimating && isOpen ? 'auto' : `${dimensions.height}px`,
              maxWidth: '900px',
              maxHeight: '80vh'
            }}
            className={cn(
              "relative bg-[#0F172A] text-white rounded-lg shadow-xl transition-all duration-500 overflow-hidden mx-6",
              "chat-modal-animate",
              isAnimating && isOpen ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4ADE80] pulse-animation">
                  <Cpu className="h-3 w-3 text-[#0F172A]" />
                </div>
                <h2 className="text-lg font-semibold">AI Chat</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-96 overflow-y-auto p-4 modal-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-md shadow-sm message-animate",
                      message.role === "user" 
                        ? "bg-[#4ADE80] text-[#0F172A]" 
                        : "bg-[#1E293B] text-white"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-[#1E293B] rounded-lg p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-[#4ADE80] typing-dot typing-dot-1"></div>
                      <div className="h-2 w-2 rounded-full bg-[#4ADE80] typing-dot typing-dot-2"></div>
                      <div className="h-2 w-2 rounded-full bg-[#4ADE80] typing-dot typing-dot-3"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#1E293B]">
              <form onSubmit={onSubmitChat} className="flex items-center gap-2">
                <Button variant="ghost" size="icon" type="button" className="text-gray-400 hover:text-white">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button" className="text-gray-400 hover:text-white">
                  <Mic className="h-5 w-5" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md bg-[#1E293B] text-white placeholder:text-[#94A3B8] border-0 focus-visible:ring-1 focus-visible:ring-[#4ADE80]"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#4ADE80] text-[#0F172A] hover:bg-[#4ADE80]/90 transition-colors duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CornerDownLeft className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Animation for expanding/unfolding the chat modal */
        .chat-modal-animate {
          animation: unfoldAnimation 0.5s cubic-bezier(0.26, 0.86, 0.44, 0.985) forwards;
        }
        
        @keyframes unfoldAnimation {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Message animation */
        .message-animate {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Typing indicator animation */
        .typing-dot {
          animation: bounce 1s infinite;
        }
        
        .typing-dot-1 {
          animation-delay: 0ms;
        }
        
        .typing-dot-2 {
          animation-delay: 100ms;
        }
        
        .typing-dot-3 {
          animation-delay: 200ms;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
        
        /* Pulse animation for AI icon */
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }
      `}</style>
    </>
  )
}

export default AIChatOverlay