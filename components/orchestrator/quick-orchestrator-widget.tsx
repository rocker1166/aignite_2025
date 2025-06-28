'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Activity, 
  Brain, 
  Zap, 
  ExternalLink,
  Users,
  Clock,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface QuickOrchestratorProps {
  className?: string
}

export default function QuickOrchestratorWidget({ className = "" }: QuickOrchestratorProps) {
  const [quickQuery, setQuickQuery] = useState("")
  const [isLaunching, setIsLaunching] = useState(false)
  const router = useRouter()

  const quickAnalysisTemplates = [
    {
      id: 'risk-analysis',
      title: 'Risk Analysis',
      query: 'Analyze supply chain risks for our electronics manufacturing operations',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30'
    },
    {
      id: 'disruption-response',
      title: 'Disruption Response',
      query: 'Evaluate impact of port congestion on our supply chain network',
      icon: <Activity className="h-4 w-4" />,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30'
    },
    {
      id: 'strategic-planning',
      title: 'Strategic Planning',
      query: 'Optimize our supply chain for the next quarter operations',
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30'
    }
  ]

  const launchFullOrchestrator = () => {
    if (!quickQuery.trim()) {
      toast({
        title: "Mission Parameter Required",
        description: "Please enter your intelligence request",
        variant: "destructive",
      })
      return
    }

    setIsLaunching(true)
    
    // Navigate to full orchestrator with query
    const params = new URLSearchParams({
      query: quickQuery.trim(),
      userId: 'demo-user'
    })
    
    router.push(`/orchestrator?${params.toString()}`)
  }

  const launchTemplate = (template: any) => {
    setIsLaunching(true)
    
    const params = new URLSearchParams({
      query: template.query,
      userId: 'demo-user'
    })
    
    router.push(`/orchestrator?${params.toString()}`)
  }

  return (
    <Card className={`border-blue-500/30 dark:border-cyan-500/30 bg-gradient-to-br from-white/80 via-blue-50/50 to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-700/50 dark:to-slate-600/50 backdrop-blur-xl shadow-xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-cyan-300">
          <Zap className="h-5 w-5" />
          Agent Command Center
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300">
          Launch multi-agent intelligence operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Quick Launch */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter intelligence request..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="bg-white/70 dark:bg-slate-700/50 border-blue-500/30 dark:border-cyan-500/30 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-blue-500/50 dark:focus:ring-cyan-500/50"
              onKeyDown={(e) => e.key === 'Enter' && launchFullOrchestrator()}
            />
            <Button
              onClick={launchFullOrchestrator}
              disabled={isLaunching || !quickQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white shrink-0 shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25"
            >
              {isLaunching ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Mission Templates</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickAnalysisTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => launchTemplate(template)}
                disabled={isLaunching}
                className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${template.color} ${
                  isLaunching ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {template.icon}
                  <span className="font-medium text-sm">{template.title}</span>
                </div>
                <p className="text-xs opacity-80 line-clamp-2">
                  {template.query}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-300/50 dark:border-slate-600/30">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span>5 Agents Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>~15s Response</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/orchestrator')}
            className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 hover:bg-blue-50 dark:hover:bg-cyan-500/10"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Full Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
