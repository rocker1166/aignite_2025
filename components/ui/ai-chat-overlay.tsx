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
    initialMessages: [{ id: "1", role: "assistant", content: "Hello! How can I assist you with your supply chain today?" }],
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
        <div className="sticky bottom-6 mx-auto w-full max-w-2xl px-6 z-10">
          <div 
            ref={inputContainerRef} 
            className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-white/10 p-2 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-blue-400/20 hover:border-blue-400/50"
          >
            <button
              type="button"
              onClick={handleOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 relative group"
              aria-label="Open Chatbot"
            >
              <Cpu className="h-4 w-4 text-white" />
              <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-slate-800/90 backdrop-blur-sm text-white text-xs rounded-md px-2 py-1 shadow-lg">
                Open Chatbot
              </span>
            </button>
            <Input
              value={inputValue}
              onChange={handleLocalInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI: 'What if my top supplier in Taiwan fails?'"
              className="h-8 flex-1 border-0 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="sm"
              className="h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 text-white font-medium shadow-lg relative ask-button-glow transition-all duration-300 hover:scale-105"
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
            "fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm transition-all duration-300 px-6 py-12",
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
              height: isAnimating && isOpen ? '450px' : `${dimensions.height}px`, // Reduced from 500px to 450px
              maxWidth: '800px', // Reduced from 900px to 800px
              maxHeight: '80vh'
            }}
            className={cn(
              "relative bg-white/30 dark:bg-slate-900/30 border border-white/20 dark:border-slate-700/20 backdrop-blur-md text-slate-800 dark:text-white rounded-lg shadow-xl transition-all duration-500 overflow-hidden",
              "chat-modal-animate",
              isAnimating && isOpen ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex items-center justify-between p-2 border-b border-blue-200/30 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mt-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 pulse-animation">
                  <Cpu className="h-2.5 w-2.5 text-white" />
                </div>
                <h2 className="text-base font-semibold">AI Supply Chain Assistant</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white mt-2 h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(450px-100px)] overflow-y-auto p-3 pt-1 modal-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "rounded-lg p-2.5 max-w-[80%] shadow-sm message-animate text-sm",
                      message.role === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                        : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-white"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 typing-dot typing-dot-1"></div>
                      <div className="h-2 w-2 rounded-full bg-blue-500 typing-dot typing-dot-2"></div>
                      <div className="h-2 w-2 rounded-full bg-blue-500 typing-dot typing-dot-3"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-blue-200/30 dark:border-blue-800/30">
              <form onSubmit={onSubmitChat} className="flex items-center gap-2">
                <Button variant="ghost" size="icon" type="button" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 h-8 w-8">
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm text-slate-800 dark:text-white text-sm placeholder:text-slate-500 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 h-8"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg send-button-glow transition-all duration-300 h-8 w-8"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
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
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        /* Glowing effect for ask button */
        /* Glowing effect for ask button */
.ask-button-glow {
  box-shadow: 0 0 15px 3px rgba(59, 130, 246, 0.8), 0 0 30px 8px rgba(79, 70, 229, 0.6) !important;
  animation: button-glow 2s infinite alternate !important;
}

.ask-button-glow:hover {
  box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.9), 0 0 40px 10px rgba(79, 70, 229, 0.7) !important;
}

@keyframes button-glow {
  from {
    box-shadow: 0 0 15px 3px rgba(59, 130, 246, 0.8), 0 0 30px 8px rgba(79, 70, 229, 0.6) !important;
  }
  to {
    box-shadow: 0 0 25px 6px rgba(59, 130, 246, 0.9), 0 0 50px 12px rgba(79, 70, 229, 0.7) !important;
  }
}
        
      `}</style>
    </>
  )
}

export default AIChatOverlay