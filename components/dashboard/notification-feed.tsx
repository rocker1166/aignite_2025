"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Info, BellOff, X, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BellIcon } from "@/components/icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { Notification } from "@/lib/types/database"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api/notifications"

type NotificationType = "alert" | "warning" | "info" | "success"

// Extended notification type with UI-specific properties
interface UINotification extends Notification {
  type: NotificationType
  time: string
}

/**
 * Displays a notification feed with filtering, marking as read, and animated UI features.
 *
 * Fetches notifications for a user, infers notification types, and presents them in a filterable, interactive list. Users can mark individual or all notifications as read, with UI updates and error handling. Falls back to mock data if fetching fails or no notifications are found.
 *
 * @returns The rendered notification feed component.
 */
export function NotificationFeed() {
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // Use a real user ID instead of the placeholder
        const userId = "bc5a0636-27ec-49e5-bd70-cde5ee45e191"
        const data = await getNotifications(userId)

        // Transform database notifications to UI notifications
        // In a real app, the type would be stored in the database
        const uiNotifications: UINotification[] = data.map((notification) => {
          // Determine notification type based on message content
          let type: NotificationType = "info"
          if (
            notification.message.toLowerCase().includes("alert") ||
            notification.message.toLowerCase().includes("risk")
          ) {
            type = "alert"
          } else if (
            notification.message.toLowerCase().includes("warning") ||
            notification.message.toLowerCase().includes("potential")
          ) {
            type = "warning"
          } else if (
            notification.message.toLowerCase().includes("success") ||
            notification.message.toLowerCase().includes("implemented")
          ) {
            type = "success"
          }

          // Format time
          const time = formatTimeAgo(new Date(notification.created_at))

          return {
            ...notification,
            type,
            time,
          }
        })

        if (uiNotifications.length > 0) {
          setNotifications(uiNotifications)
        } else {
          // If no notifications found, use mock data
          setNotifications(mockNotifications)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        // Fall back to mock data
        setNotifications(mockNotifications)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(
        notifications.map((notification) =>
          notification.notification_id === id ? { ...notification, read_status: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Use a real user ID instead of the placeholder
      const userId = "bc5a0636-27ec-49e5-bd70-cde5ee45e191"
      await markAllNotificationsAsRead(userId)
      setNotifications(notifications.map((notification) => ({ ...notification, read_status: true })))

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const getNotificationBg = (type: NotificationType, read: boolean) => {
    if (read) return "bg-white/40 dark:bg-slate-800/40"
    
    switch (type) {
      case "alert":
        return "bg-gradient-to-r from-red-500/10 to-red-600/5"
      case "warning":
        return "bg-gradient-to-r from-amber-500/10 to-amber-600/5"
      case "info":
        return "bg-gradient-to-r from-blue-500/10 to-blue-600/5"
      case "success":
        return "bg-gradient-to-r from-green-500/10 to-green-600/5"
    }
  }

  const getNotificationBorder = (type: NotificationType, read: boolean) => {
    if (read) return "border-transparent"
    
    switch (type) {
      case "alert":
        return "border-red-300/30 dark:border-red-800/30"
      case "warning":
        return "border-amber-300/30 dark:border-amber-800/30"
      case "info":
        return "border-blue-300/30 dark:border-blue-800/30"
      case "success":
        return "border-green-300/30 dark:border-green-800/30"
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === filter)

  const unreadCount = notifications.filter(n => !n.read_status).length

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BellIcon size={20} className="text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-500 hover:bg-red-600">
                {unreadCount} new
              </Badge>
            )}
          </h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1 text-xs border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 bg-white/20 hover:bg-white/30 dark:bg-slate-800/20 dark:hover:bg-slate-800/30"
        >
          <BellOff className="h-3 w-3 mr-1" />
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800">
        <Button 
          variant={filter === 'all' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? "bg-blue-500 hover:bg-blue-600" : ""}
        >
          All
        </Button>
        <Button 
          variant={filter === 'alert' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilter('alert')}
          className={filter === 'alert' ? "bg-red-500 hover:bg-red-600" : ""}
        >
          Alerts
        </Button>
        <Button 
          variant={filter === 'warning' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilter('warning')}
          className={filter === 'warning' ? "bg-amber-500 hover:bg-amber-600" : ""}
        >
          Warnings
        </Button>
        <Button 
          variant={filter === 'info' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilter('info')}
          className={filter === 'info' ? "bg-blue-500 hover:bg-blue-600" : ""}
        >
          Info
        </Button>
        <Button 
          variant={filter === 'success' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilter('success')}
          className={filter === 'success' ? "bg-green-500 hover:bg-green-600" : ""}
        >
          Success
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400"
            >
              <BellOff className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No {filter !== 'all' ? filter : ''} notifications to display</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.notification_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all duration-200 hover:shadow-md",
                  getNotificationBg(notification.type, notification.read_status),
                  getNotificationBorder(notification.type, notification.read_status),
                  "backdrop-blur-md"
                )}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="font-medium">{notification.notification_type}</p>
                      {!notification.read_status && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{notification.time}</p>
                      {!notification.read_status && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                  <div className="pt-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Mock notifications for fallback
const mockNotifications: UINotification[] = [
  {
    notification_id: "1",
    user_id: "placeholder-user-id",
    message: "Supplier XYZ has a risk score above 80%. Immediate action recommended.",
    notification_type: "High Risk Alert",
    read_status: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    type: "alert",
    time: "5 minutes ago",
  },
  {
    notification_id: "2",
    user_id: "placeholder-user-id",
    message: "Weather alert detected for Port of Shanghai. Possible shipping delays expected.",
    notification_type: "Potential Disruption",
    read_status: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    type: "warning",
    time: "30 minutes ago",
  },
  {
    notification_id: "3",
    user_id: "placeholder-user-id",
    message: "Your 'Port Strike' simulation has completed. View results now.",
    notification_type: "Simulation Complete",
    read_status: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
    type: "info",
    time: "1 hour ago",
  },
  {
    notification_id: "4",
    user_id: "placeholder-user-id",
    message: "Alternate routing strategy successfully implemented. Risk reduced by 15%.",
    notification_type: "Strategy Implemented",
    read_status: true,
    created_at: new Date(Date.now() - 3 * 60 * 60000).toISOString(), // 3 hours ago
    type: "success",
    time: "3 hours ago",
  },
  {
    notification_id: "5",
    user_id: "placeholder-user-id",
    message: "A new supplier matching your criteria has been identified in your region.",
    notification_type: "New Supplier Available",
    read_status: true,
    created_at: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
    type: "info",
    time: "5 hours ago",
  },
  {
    notification_id: "6",
    user_id: "placeholder-user-id",
    message: "Component X inventory below safety stock. Reorder recommended.",
    notification_type: "Inventory Alert",
    read_status: true,
    created_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    type: "warning",
    time: "1 day ago",
  },
]
