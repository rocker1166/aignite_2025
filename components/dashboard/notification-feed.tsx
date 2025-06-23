"use client"

import { AlertTriangle, CheckCircle, Info, Bell, BellOff, X, ArrowRight, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const allNotifications = [
  {
    id: 1,
    type: "alert",
    title: "High Risk Alert",
    message: "Supplier XYZ has a risk score above 80%. Immediate action recommended.",
    time: "5 minutes ago",
    icon: AlertTriangle,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/5 hover:bg-red-500/10",
    borderColor: "border-red-500/10"
  },
  {
    id: 2,
    type: "warning",
    title: "Potential Disruption",
    message: "Weather alert detected for Port of Shanghai. Possible shipping delays expected.",
    time: "30 minutes ago",
    icon: AlertTriangle,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/5 hover:bg-amber-500/10",
    borderColor: "border-amber-500/10"
  },
  {
    id: 3,
    type: "info",
    title: "Simulation Complete",
    message: "Your 'Port Strike' simulation has completed. View results now.",
    time: "1 hour ago",
    icon: Info,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/5 hover:bg-blue-500/10",
    borderColor: "border-blue-500/10"
  },
  {
    id: 4,
    type: "success",
    title: "Strategy Implementation",
    message: "New supplier diversification strategy has been approved and is ready for implementation.",
    time: "3 hours ago",
    icon: CheckCircle,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/5 hover:bg-emerald-500/10",
    borderColor: "border-emerald-500/10"
  },
  {
    id: 5,
    type: "info",
    title: "New Supplier Added",
    message: "A new supplier has been added to your network. Review their details.",
    time: "5 hours ago",
    icon: Bell,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/5 hover:bg-blue-500/10",
    borderColor: "border-blue-500/10"
  },
  {
    id: 6,
    type: "warning",
    title: "Inventory Alert",
    message: "Component X stock level is below threshold. Consider reordering.",
    time: "1 day ago",
    icon: AlertTriangle,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/5 hover:bg-amber-500/10",
    borderColor: "border-amber-500/10"
  },
  // Additional notifications that will be loaded
  {
    id: 7,
    type: "info",
    title: "System Update",
    message: "Supply chain monitoring system will undergo maintenance in 48 hours.",
    time: "1 day ago",
    icon: Info,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/5 hover:bg-blue-500/10",
    borderColor: "border-blue-500/10"
  },
  {
    id: 8,
    type: "success",
    title: "Cost Reduction",
    message: "Automated routing optimization saved 12% in transportation costs this month.",
    time: "2 days ago",
    icon: CheckCircle,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/5 hover:bg-emerald-500/10",
    borderColor: "border-emerald-500/10"
  }
]

export function NotificationFeed() {
  const { toast } = useToast()
  const [displayCount, setDisplayCount] = useState(6)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 3, allNotifications.length))
      setIsLoading(false)
    }, 500)
  }

  const hasMoreNotifications = displayCount < allNotifications.length

  return (
    <div className="space-y-3">
      {allNotifications.slice(0, displayCount).map((notification) => {
        const Icon = notification.icon
        return (
          <div
            key={notification.id}
            className={`flex items-start space-x-4 rounded-lg border p-4 backdrop-blur-lg transition-all duration-200 ${notification.bgColor} ${notification.borderColor}`}
          >
            <Icon className={`h-5 w-5 ${notification.color}`} />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${notification.color}`}>
                  {notification.title}
                </p>
                <button
                  onClick={() => {
                    toast({
                      title: "Notification dismissed",
                      description: "The notification has been removed from your feed.",
                    })
                  }}
                  className={`rounded-full p-1.5 transition-colors ${notification.bgColor.replace('hover:', '')}`}
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <p className="text-sm text-slate-300">{notification.message}</p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500">{notification.time}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 text-xs ${notification.color} hover:${notification.bgColor.split(' ')[1]}`}
                >
                  View Details <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
      
      {hasMoreNotifications && (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full mt-4 p-3 flex items-center justify-center gap-2 rounded-lg border border-slate-800/50 bg-slate-900/20 backdrop-blur-xl transition-all duration-200 hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <MoreHorizontal className="h-5 w-5 animate-pulse" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <MoreHorizontal className="h-5 w-5" />
              <span>Load More</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
