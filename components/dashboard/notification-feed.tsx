"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types/database"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api/notifications"

type NotificationType = "alert" | "warning" | "info" | "success"

// Extended notification type with UI-specific properties
interface UINotification extends Notification {
  type: NotificationType
  time: string
}

export function NotificationFeed() {
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [loading, setLoading] = useState(true)
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
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "info":
        return <Info className="h-5 w-5 text-info" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />
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

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
          Mark all as read
        </Button>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.notification_id}
            className={cn(
              "flex items-start gap-4 rounded-lg border p-4 transition-colors",
              notification.read_status ? "bg-background" : "bg-muted",
            )}
          >
            <div className="mt-1">{getIcon(notification.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{notification.notification_type}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                  {!notification.read_status && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleMarkAsRead(notification.notification_id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            </div>
          </div>
        ))}
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
