"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Lightbulb,
  Zap,
  Users,
  Target
} from "lucide-react"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Insight {
  id: string
  type: 'blocker' | 'suggestion' | 'alert' | 'success'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
}

interface ExecutionAssistantAgentProps {
  strategy: any
}

export function ExecutionAssistantAgent({ strategy }: ExecutionAssistantAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI execution assistant. I can help you track progress, identify blockers, and suggest optimizations for your supply chain strategy. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const [insights] = useState<Insight[]>([
    {
      id: '1',
      type: 'blocker',
      title: 'Budget Approval Pending',
      description: 'Port of LA rerouting contract is awaiting budget approval. This is blocking 3 dependent tasks.',
      priority: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'Switch to Alternate Carrier',
      description: 'Consider switching to alternate carrier for FedEx Hub to reduce delivery time by 2 days.',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      id: '3',
      type: 'alert',
      title: 'TSMC Tasks Behind Schedule',
      description: 'TSMC Fab 21 tasks are running 2 days behind schedule. Consider reallocating resources.',
      priority: 'high',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      id: '4',
      type: 'success',
      title: 'FedEx Hub Completed',
      description: 'All tasks at FedEx Hub Memphis have been completed successfully ahead of schedule.',
      priority: 'low',
      timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    }
  ])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'blocker':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'alert':
        return <Clock className="w-4 h-4 text-orange-400" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'blocker':
        return 'bg-red-500/10 border-red-500/20'
      case 'suggestion':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'alert':
        return 'bg-orange-500/10 border-orange-500/20'
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const quickPrompts = [
    "What are the top 3 blockers on this strategy?",
    "Suggest workaround for delayed node",
    "Summarize task progress at Port of LA",
    "Show critical path analysis",
    "Identify resource bottlenecks"
  ]

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the current data, I can see that the main blocker is the budget approval for the Port of LA rerouting contract. This is affecting 3 dependent tasks.",
        "For the delayed TSMC node, I recommend reallocating resources from the completed FedEx Hub tasks to accelerate the chip buffer stock reallocation.",
        "The Port of LA is currently 65% complete with 2 tasks remaining. The main blocker is the contract rerouting partner task which is awaiting budget approval.",
        "The critical path includes: Port of LA → TSMC Fab 21 → Final Assembly. Any delay in these nodes will impact the overall timeline.",
        "Resource bottlenecks identified: Logistics team is overloaded with 8 active tasks. Consider redistributing to Operations team."
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5 text-blue-400" />
          AI Execution Assistant
        </CardTitle>
        <p className="text-sm text-slate-400">Get real-time insights and suggestions</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Insights Panel */}
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="font-semibold text-white mb-3">Live Insights</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-white text-sm">{insight.title}</span>
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mb-2">{insight.description}</p>
                <span className="text-xs text-slate-500">
                  {insight.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="font-semibold text-white mb-3">Quick Prompts</h3>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-slate-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about strategy execution..."
              className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  )
} 