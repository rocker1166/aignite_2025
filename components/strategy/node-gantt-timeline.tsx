"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  GitBranch,
  TrendingUp,
  TrendingDown
} from "lucide-react"

interface Task {
  id: number
  title: string
  status: string
  deadline: string
  priority: string
  assignee: string
  blocker?: string
  startDate: string
  duration: number
  nodeName: string
}

interface Node {
  id: number
  name: string
  tasks: Task[]
}

interface NodeGanttTimelineProps {
  nodes: Node[]
}

export function NodeGanttTimeline({ nodes }: NodeGanttTimelineProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null)

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Blocked":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case "In Progress":
        return <Clock className="w-3 h-3 text-blue-400" />
      case "Blocked":
        return <XCircle className="w-3 h-3 text-red-400" />
      default:
        return <Pause className="w-3 h-3 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTimelineDates = () => {
    const allTasks = nodes.flatMap(node => node.tasks)
    const startDates = allTasks.map(task => new Date(task.startDate))
    const endDates = allTasks.map(task => {
      const start = new Date(task.startDate)
      start.setDate(start.getDate() + task.duration)
      return start
    })
    
    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())))
    
    const dates = []
    const current = new Date(minDate)
    while (current <= maxDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const getTaskPosition = (task: Task) => {
    const dates = getTimelineDates()
    const startDate = new Date(task.startDate)
    const startIndex = dates.findIndex(date => 
      date.toDateString() === startDate.toDateString()
    )
    const width = (task.duration / dates.length) * 100
    const left = (startIndex / dates.length) * 100
    
    return { left: `${left}%`, width: `${width}%` }
  }

  const getCompletionPercentage = (node: Node) => {
    const totalTasks = node.tasks.length
    const completedTasks = node.tasks.filter(task => task.status === "Done").length
    return Math.round((completedTasks / totalTasks) * 100)
  }

  const getNodeStatusColor = (node: Node) => {
    const percentage = getCompletionPercentage(node)
    if (percentage >= 80) return "border-green-500 bg-green-500/20"
    if (percentage >= 50) return "border-blue-500 bg-blue-500/20"
    if (percentage >= 20) return "border-yellow-500 bg-yellow-500/20"
    return "border-red-500 bg-red-500/20"
  }

  const timelineDates = getTimelineDates()

  return (
    <TooltipProvider>
      <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Gantt Timeline</h3>
              <p className="text-sm text-slate-400 font-normal">Visualize task dependencies and timelines</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <div className="flex items-center gap-4">
                <h4 className="font-semibold text-white">Timeline Overview</h4>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {timelineDates.length} days
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Blocked</span>
                </div>
              </div>
            </div>

            {/* Date Header */}
            <div className="relative">
              <div className="flex border-b border-slate-600">
                <div className="w-48 flex-shrink-0 p-3 bg-slate-700/50 border-r border-slate-600">
                  <span className="text-sm font-medium text-slate-300">Nodes & Tasks</span>
                </div>
                <div className="flex-1 flex">
                  {timelineDates.map((date, index) => (
                    <div 
                      key={index} 
                      className="flex-1 p-2 text-center border-r border-slate-600 last:border-r-0 bg-slate-700/30"
                    >
                      <div className="text-xs text-slate-400 font-medium">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Rows */}
            <div className="space-y-2">
              {nodes.map((node, nodeIndex) => (
                <div key={node.id} className="relative">
                  {/* Node Header */}
                  <div 
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-slate-700/50 ${
                      selectedNode?.id === node.id ? 'bg-slate-700/70 border-2 border-blue-500/50' : 'bg-slate-700/30'
                    }`}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    style={{ animationDelay: `${nodeIndex * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getNodeStatusColor(node).split(' ')[0]}`} />
                      <div>
                        <h5 className="font-semibold text-white flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-blue-400" />
                          {node.name}
                        </h5>
                        <p className="text-sm text-slate-400">{node.tasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getNodeStatusColor(node)}`}>
                        {getCompletionPercentage(node)}% Complete
                      </Badge>
                      <div className="w-24 bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                            getCompletionPercentage(node) >= 80 ? 'bg-green-500' :
                            getCompletionPercentage(node) >= 50 ? 'bg-blue-500' :
                            getCompletionPercentage(node) >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${getCompletionPercentage(node)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task Timeline */}
                  {selectedNode?.id === node.id && (
                    <div className="mt-2 space-y-2 animate-fade-in-up">
                      {node.tasks.map((task, taskIndex) => {
                        const position = getTaskPosition(task)
                        return (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                              <div 
                                className="relative h-12 bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden"
                                onMouseEnter={() => setHoveredTask(task)}
                                onMouseLeave={() => setHoveredTask(null)}
                                style={{ animationDelay: `${taskIndex * 50}ms` }}
                              >
                                {/* Task Bar */}
                                <div 
                                  className={`absolute top-2 h-8 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                    getTaskStatusColor(task.status)
                                  } ${hoveredTask?.id === task.id ? 'ring-2 ring-white/50' : ''}`}
                                  style={{ 
                                    left: position.left, 
                                    width: position.width,
                                    minWidth: '60px'
                                  }}
                                >
                                  <div className="flex items-center justify-between h-full px-2">
                                    <div className="flex items-center gap-1">
                                      {getTaskStatusIcon(task.status)}
                                      <span className="text-xs font-medium text-white truncate">
                                        {task.title}
                                      </span>
                                    </div>
                                    {task.blocker && (
                                      <AlertTriangle className="w-3 h-3 text-yellow-300" />
                                    )}
                                  </div>
                                </div>

                                {/* Task Info */}
                                <div className="absolute left-0 top-0 bottom-0 w-48 flex items-center px-4 bg-slate-700/50 border-r border-slate-600">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${getTaskStatusColor(task.status)}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                      <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <User className="w-3 h-3" />
                                        <span>{task.assignee}</span>
                                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            
                            <TooltipContent side="top" className="w-80 p-4 bg-slate-800 border-slate-600 shadow-2xl">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-white">{task.title}</h4>
                                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-400">Assignee</p>
                                    <p className="text-white font-medium">{task.assignee}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Duration</p>
                                    <p className="text-white font-medium">{task.duration} days</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Start Date</p>
                                    <p className="text-white font-medium">{task.startDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Deadline</p>
                                    <p className="text-white font-medium">{task.deadline}</p>
                                  </div>
                                </div>

                                {task.blocker && (
                                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 text-red-400" />
                                      <span className="text-sm text-red-400 font-medium">Blocked: {task.blocker}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <GitBranch className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm text-slate-400">{task.nodeName}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Timeline Summary */}
            <Card className="bg-slate-700/30 border-slate-600/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {nodes.reduce((sum, node) => sum + node.tasks.length, 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {nodes.reduce((sum, node) => 
                        sum + node.tasks.filter(task => task.status === "Done").length, 0
                      )}
                    </div>
                    <div className="text-sm text-slate-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {nodes.reduce((sum, node) => 
                        sum + node.tasks.filter(task => task.status === "In Progress").length, 0
                      )}
                    </div>
                    <div className="text-sm text-slate-400">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {nodes.reduce((sum, node) => 
                        sum + node.tasks.filter(task => task.status === "Blocked").length, 0
                      )}
                    </div>
                    <div className="text-sm text-slate-400">Blocked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </TooltipProvider>
  )
} 