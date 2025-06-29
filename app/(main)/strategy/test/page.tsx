import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Target, GitBranch, BarChart3 } from "lucide-react"

export default function StrategyTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🚀 Dynamic Strategy Execution</h1>
          <p className="text-xl text-slate-400 mb-8">
            AI-powered supply chain strategy execution with real-time data
          </p>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
            Production Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-400" />
                Sample Strategy #1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                Logistics Disruption Recovery - A comprehensive dual sourcing strategy with 8 tasks across 3 nodes.
              </p>
              <div className="flex gap-2 mb-4">
                <Badge className="bg-orange-500/20 text-orange-400">High Priority</Badge>
                <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
              </div>
              <Link href="/strategy/dynamic?strategyId=c9137328-1667-40fc-a415-04170890d3b9">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  View Execution Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Sample Strategy #2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                Manufacturing Slowdown Mitigation - Capacity optimization strategy for production facilities.
              </p>
              <div className="flex gap-2 mb-4">
                <Badge className="bg-red-500/20 text-red-400">Critical</Badge>
                <Badge className="bg-purple-500/20 text-purple-400">Planning</Badge>
              </div>
              <Link href="/strategy/dynamic?strategyId=dfeee6f2-611b-43e1-9cb4-bec0eeb7e839">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <GitBranch className="w-4 h-4 mr-2" />
                  View Strategy
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader>
            <CardTitle>🤖 AI Agent Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Dynamic Data Generation</h4>
                <p className="text-slate-400 text-sm">
                  Strategies are generated using Gemini AI based on strategy ID and supply chain context
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Database Integration</h4>
                <p className="text-slate-400 text-sm">
                  Data is stored in Supabase with proper relational structure for nodes and tasks
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Real-time Updates</h4>
                <p className="text-slate-400 text-sm">
                  Live progress tracking with task status updates and team assignments
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Caching & Performance</h4>
                <p className="text-slate-400 text-sm">
                  Intelligent caching prevents unnecessary AI calls while maintaining fresh data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            Try the AI-powered strategy generator:
          </p>
          <Link href="/strategy/dynamic?generateNew=true">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              🧠 Generate New Strategy with AI
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
