'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Clock, 
  Users, 
  ArrowRight,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Cpu,
  Network,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Radio,
  Wifi
} from 'lucide-react';

interface AgentState {
  id: string;
  name: string;
  icon: any;
  status: 'idle' | 'thinking' | 'communicating' | 'executing' | 'completed';
  task: string;
  progress: number;
  lastMessage: string;
  timestamp: number;
}

interface AgentCommunication {
  from: string;
  to: string;
  message: string;
  timestamp: number;
  type: 'request' | 'response' | 'data' | 'decision';
}

export default function OrchestratorWidget() {
  const [quickQuery, setQuickQuery] = useState('');
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [communications, setCommunications] = useState<AgentCommunication[]>([]);
  const [isActiveSession, setIsActiveSession] = useState(false);

  // Initialize agents with realistic states
  useEffect(() => {
    const initialAgents: AgentState[] = [
      {
        id: 'intelligence',
        name: 'Intelligence',
        icon: Eye,
        status: 'idle',
        task: 'Monitoring supply chain data streams',
        progress: 85,
        lastMessage: 'Real-time weather data analyzed',
        timestamp: Date.now() - 45000
      },
      {
        id: 'forecast',
        name: 'Forecast',
        icon: TrendingUp,
        status: 'thinking',
        task: 'Processing demand patterns',
        progress: 67,
        lastMessage: 'Q4 demand spike predicted in electronics',
        timestamp: Date.now() - 120000
      },
      {
        id: 'scenario',
        name: 'Scenario',
        icon: Brain,
        status: 'idle',
        task: 'Standby for disruption modeling',
        progress: 100,
        lastMessage: 'Monte Carlo simulations ready',
        timestamp: Date.now() - 300000
      },
      {
        id: 'impact',
        name: 'Impact',
        icon: BarChart3,
        status: 'communicating',
        task: 'Calculating financial exposure',
        progress: 43,
        lastMessage: 'Risk assessment: $2.3M potential impact',
        timestamp: Date.now() - 30000
      },
      {
        id: 'strategy',
        name: 'Strategy',
        icon: Target,
        status: 'executing',
        task: 'Developing mitigation protocols',
        progress: 78,
        lastMessage: 'Alternative route optimization complete',
        timestamp: Date.now() - 60000
      }
    ];
    
    setAgents(initialAgents);
    
    // Simulate recent communications
    const recentComms: AgentCommunication[] = [
      {
        from: 'Intelligence',
        to: 'Forecast',
        message: 'Weather disruption detected in Pacific routes',
        timestamp: Date.now() - 180000,
        type: 'data'
      },
      {
        from: 'Forecast',
        to: 'Scenario',
        message: 'Requesting disruption impact modeling',
        timestamp: Date.now() - 120000,
        type: 'request'
      },
      {
        from: 'Impact',
        to: 'Strategy',
        message: 'High-priority risk identified: immediate action needed',
        timestamp: Date.now() - 90000,
        type: 'decision'
      }
    ];
    
    setCommunications(recentComms);
  }, []);

  // Simulate live agent activity
  useEffect(() => {
    if (!isActiveSession) return;

    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const shouldUpdate = Math.random() > 0.7;
        if (!shouldUpdate) return agent;

        const statusOptions: AgentState['status'][] = ['thinking', 'communicating', 'executing', 'idle'];
        const newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        const tasks = {
          intelligence: [
            'Scanning port congestion data',
            'Analyzing weather patterns',
            'Processing market signals',
            'Monitoring news feeds'
          ],
          forecast: [
            'Calculating demand projections',
            'Processing seasonal trends',
            'Analyzing price fluctuations',
            'Updating risk models'
          ],
          scenario: [
            'Running disruption simulations',
            'Modeling cascade failures',
            'Testing contingency plans',
            'Evaluating alternatives'
          ],
          impact: [
            'Quantifying financial exposure',
            'Calculating ROI metrics',
            'Assessing time-to-recovery',
            'Measuring operational impact'
          ],
          strategy: [
            'Optimizing resource allocation',
            'Developing action plans',
            'Coordinating response teams',
            'Implementing safeguards'
          ]
        };

        const newTask = tasks[agent.id as keyof typeof tasks]?.[
          Math.floor(Math.random() * tasks[agent.id as keyof typeof tasks]?.length)
        ] || agent.task;

        return {
          ...agent,
          status: newStatus,
          task: newTask,
          progress: Math.min(100, agent.progress + Math.floor(Math.random() * 15) - 5),
          timestamp: Date.now()
        };
      }));

      // Add new communication
      if (Math.random() > 0.6) {
        const agentNames = ['Intelligence', 'Forecast', 'Scenario', 'Impact', 'Strategy'];
        const messages = [
          'Data correlation detected',
          'Risk threshold exceeded',
          'Optimization complete',
          'Pattern recognition successful',
          'Decision tree updated',
          'Anomaly detected and flagged',
          'Coordination protocol activated'
        ];
        
        const newComm: AgentCommunication = {
          from: agentNames[Math.floor(Math.random() * agentNames.length)],
          to: agentNames[Math.floor(Math.random() * agentNames.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: Date.now(),
          type: ['request', 'response', 'data', 'decision'][Math.floor(Math.random() * 4)] as any
        };
        
        setCommunications(prev => [newComm, ...prev.slice(0, 4)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isActiveSession]);

  const getStatusIcon = (status: AgentState['status']) => {
    switch (status) {
      case 'thinking': return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
      case 'communicating': return <Radio className="w-3 h-3 animate-pulse text-green-500" />;
      case 'executing': return <Zap className="w-3 h-3 text-orange-500" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      default: return <div className="w-3 h-3 bg-slate-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: AgentState['status']) => {
    switch (status) {
      case 'thinking': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'communicating': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'executing': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'completed': return 'border-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'border-slate-300 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getCommunicationTypeIcon = (type: AgentCommunication['type']) => {
    switch (type) {
      case 'request': return <MessageCircle className="w-3 h-3 text-blue-500" />;
      case 'response': return <ArrowRight className="w-3 h-3 text-green-500" />;
      case 'data': return <Cpu className="w-3 h-3 text-purple-500" />;
      case 'decision': return <AlertTriangle className="w-3 h-3 text-orange-500" />;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const quickScenarios = [
    {
      title: "Port Disruption",
      query: "Analyze LA Port congestion impact",
      nodeId: "LA-PORT-001",
      urgency: "high"
    },
    {
      title: "Weather Risk", 
      query: "Storm impact on distribution",
      nodeId: "WAREHOUSE-NYC-001",
      urgency: "medium"
    },
    {
      title: "Supply Risk",
      query: "Electronics supply chain risks",
      nodeId: "FACTORY-001", 
      urgency: "low"
    }
  ];

  const recentMetrics = {
    avgResponseTime: 12.5,
    efficiency: 94,
    agentsActive: 5,
    lastExecution: "2 minutes ago"
  };

  return (
    <Card className="bg-gradient-to-br from-card via-muted/20 to-card border-border text-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-foreground">MACG Orchestrator</CardTitle>
              <CardDescription className="text-muted-foreground">Multi-Agent Coordination Graph</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {isActiveSession ? 'Live Session' : 'Ready'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsActiveSession(!isActiveSession)}
              className="text-xs"
            >
              {isActiveSession ? <Radio className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Live Agent Communication Stream */}
        {isActiveSession && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-foreground">Live Agent Communications</span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto border border-border/50">
              {communications.length > 0 ? communications.map((comm, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {getCommunicationTypeIcon(comm.type)}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{comm.from}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-purple-600 dark:text-purple-400 font-medium">{comm.to}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-foreground">{comm.message}</span>
                  <span className="text-muted-foreground ml-auto">{formatTimeAgo(comm.timestamp)}</span>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No active communications
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Agent Status Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">Agent Status</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {agents.filter(a => a.status !== 'idle').length} Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className={`p-3 rounded-lg border transition-all ${getStatusColor(agent.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <agent.icon className="w-4 h-4 text-foreground" />
                    <span className="font-medium text-sm text-foreground">{agent.name}</span>
                    {getStatusIcon(agent.status)}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {agent.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">{agent.task}</div>
                  {agent.status !== 'idle' && (
                    <div className="flex items-center gap-2">
                      <Progress value={agent.progress} className="h-1 flex-1" />
                      <span className="text-xs text-muted-foreground">{agent.progress}%</span>
                    </div>
                  )}
                  <div className="text-xs text-foreground">{agent.lastMessage}</div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(agent.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Quick intelligence query..."
              className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
            />
            <Link href={`/orchestrator?query=${encodeURIComponent(quickQuery)}`}>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={!quickQuery.trim()}
              >
                <Zap className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {/* Quick Scenarios */}
          <div className="grid grid-cols-1 gap-2">
            {quickScenarios.map((scenario, idx) => (
              <Link 
                key={idx}
                href={`/orchestrator?query=${encodeURIComponent(scenario.query)}&nodeId=${scenario.nodeId}`}
              >
                <button className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-border/60 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{scenario.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            scenario.urgency === 'high' ? 'border-red-500 text-red-600 dark:text-red-400' :
                            scenario.urgency === 'medium' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' :
                            'border-green-500 text-green-600 dark:text-green-400'
                          }`}
                        >
                          {scenario.urgency}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs mt-1">{scenario.query}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground">Avg Response</span>
            </div>
            <div className="text-xl font-bold text-foreground">{recentMetrics.avgResponseTime}s</div>
            <div className="text-xs text-green-600 dark:text-green-400">94% faster than legacy</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-muted-foreground">Efficiency</span>
            </div>
            <div className="text-xl font-bold text-foreground">{recentMetrics.efficiency}%</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Workflow optimization</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Agents Ready</span>
            </div>
            <div className="text-xl font-bold text-foreground">{recentMetrics.agentsActive}</div>
            <div className="text-xs text-green-600 dark:text-green-400">All systems operational</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-muted-foreground">Last Execution</span>
            </div>
            <div className="text-sm font-bold text-foreground">{recentMetrics.lastExecution}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Electronics risk analysis</div>
          </div>
        </div>

        {/* Action Button */}
        <Link href="/orchestrator">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Brain className="w-4 h-4 mr-2" />
            Launch Full Orchestrator
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
