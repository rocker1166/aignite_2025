"use client"

import { Activity, Clock, Network, Play, Sparkles } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type ActivityType = "simulation" | "digital-twin" | "strategy" | "general"

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  time: string
  user: string
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "simulation",
    title: "Simulation Run",
    description: "Port Strike scenario simulation completed",
    time: "10 minutes ago",
    user: "John Doe",
  },
  {
    id: "2",
    type: "digital-twin",
    title: "Digital Twin Updated",
    description: "Added 3 new suppliers to Electronics Supply Chain",
    time: "1 hour ago",
    user: "Jane Smith",
  },
  {
    id: "3",
    type: "strategy",
    title: "Strategy Applied",
    description: "Implemented dual-sourcing strategy for critical components",
    time: "3 hours ago",
    user: "John Doe",
  },
  {
    id: "4",
    type: "general",
    title: "KPI Alert",
    description: "Risk score increased by 15% in the last 24 hours",
    time: "5 hours ago",
    user: "System",
  },
  {
    id: "5",
    type: "simulation",
    title: "Simulation Created",
    description: "New Natural Disaster scenario created",
    time: "1 day ago",
    user: "Jane Smith",
  },
  {
    id: "6",
    type: "strategy",
    title: "Strategy Recommendation",
    description: "AI generated 3 new strategy recommendations",
    time: "2 days ago",
    user: "System",
  },
]

export function RecentActivityList() {
  const [activities] = useState<ActivityItem[]>(mockActivities)

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "simulation":
        return <Play className="h-5 w-5 text-primary" />
      case "digital-twin":
        return <Network className="h-5 w-5 text-info" />
      case "strategy":
        return <Sparkles className="h-5 w-5 text-warning" />
      case "general":
        return <Activity className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          View Timeline
        </Button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
            <div className="mt-1">{getIcon(activity.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{activity.title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">By: {activity.user}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
