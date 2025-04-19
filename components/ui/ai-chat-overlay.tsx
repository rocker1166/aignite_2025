"use client"
import { useState, useRef } from "react"
import Draggable from "react-draggable"
import type React from "react"

import { Cpu, Paperclip, Mic, CornerDownLeft, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"

function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingBarRef = useRef<HTMLDivElement>(null) // Fixed ref type
  const messagesEndRef = useRef<HTMLDivElement>(null) // Added ref for messages end
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    initialMessages: [{ id: "1", role: "assistant", content: "Hello! How can I assist you with your supply chain today?" }],
  })

  const handleOpen = () => {
    setIsAnimating(true)
    setIsOpen(true)
    setDragPosition({ x: 0, y: 0 }) // Reset position to base of the screen

    if (inputValue.trim() !== "") {
      append({ content: inputValue, role: "user" })
      setInputValue("")
    }
  }

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

  // Handle dragging position
  const handleDrag = (e: any, data: { x: number; y: number }) => {
    setDragPosition({ x: data.x, y: data.y })
  }

  return (
    <>
      {!isOpen && (
        <Draggable
        nodeRef={typingBarRef as React.RefObject<HTMLElement>} 
          position={dragPosition}
          onDrag={handleDrag}
        >
          <div
            ref={typingBarRef}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-6 z-10"
          >
            <div 
              className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-white/10 p-2 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-blue-400/20 hover:border-blue-400/50"
            >
              <button
                type="button"
                onClick={handleOpen}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 relative group"
                aria-label="Open Chatbot"
              >
                <Cpu className="h-4 w-4 text-white" />
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
        </Draggable>
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
            className={cn(
              "relative bg-white/30 dark:bg-slate-900/30 border border-white/20 dark:border-slate-700/20 backdrop-blur-md text-slate-800 dark:text-white rounded-lg shadow-xl transition-all duration-500 overflow-hidden",
              "chat-modal-animate"
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
    </>
  )
}

export default AIChatOverlay