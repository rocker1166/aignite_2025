"use client"


import { useState } from "react"
import { AlertTriangle, CheckCircle, Info, BellOff, X, ArrowRight, Plus, Truck, MapPin, Package, Route, AlertCircle, Zap, Factory, Wrench, Filter, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BellIcon } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"

type NotificationType = "alert" | "warning" | "info" | "success"
type NotificationCategory = "all" | "edge" | "node"
type MainTab = "alerts" | "activity"

interface UINotification {
  id: string
  title: string
  message: string
  type: NotificationType
  category: "edge" | "node"
  icon: React.ReactNode
  timestamp: string
  read: boolean
}

// Mock data for notifications
const mockNotifications: UINotification[] = [
  // Edge (Transport/Logistics) notifications
  {
    id: "edge-1",
    title: "Route Disruption Alert",
    message: "Major highway closure detected on Route A1. Expected delay: 4-6 hours for shipments.",
    type: "alert",
    category: "edge",
    icon: <Route className="h-5 w-5" />,
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: "edge-2", 
    title: "Port Congestion Warning",
    message: "Port of Los Angeles experiencing high congestion. Recommend alternative routing.",
    type: "warning",
    category: "edge",
    icon: <Truck className="h-5 w-5" />,
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: "edge-3",
    title: "Shipping Optimized",
    message: "AI routing algorithm reduced transportation costs by 12% on Route B3.",
    type: "success",
    category: "edge",
    icon: <CheckCircle className="h-5 w-5" />,
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "edge-4",
    title: "Weather Impact Update",
    message: "Storm system cleared. Normal shipping operations resumed on all sea routes.",
    type: "info",
    category: "edge",
    icon: <Info className="h-5 w-5" />,
    timestamp: "3 hours ago",
    read: false,
  },
  {
    id: "edge-5",
    title: "Fuel Price Spike",
    message: "Transportation costs increased by 8% due to fuel price volatility.",
    type: "warning",
    category: "edge",
    icon: <AlertTriangle className="h-5 w-5" />,
    timestamp: "6 hours ago",
    read: true,
  },

  // Node (Facility/Supplier) notifications
  {
    id: "node-1",
    title: "Supplier Risk Alert",
    message: "Supplier TechCorp shows elevated financial risk indicators. Risk score: 85/100.",
    type: "alert",
    category: "node",
    icon: <AlertCircle className="h-5 w-5" />,
    timestamp: "5 minutes ago",
    read: false,
  },
  {
    id: "node-2",
    title: "Production Capacity Alert",
    message: "Manufacturing Node M3 operating at 95% capacity. Bottleneck detected.",
    type: "warning",
    category: "node",
    icon: <Factory className="h-5 w-5" />,
    timestamp: "12 minutes ago",
    read: false,
  },
  {
    id: "node-3",
    title: "Quality Certification Renewed",
    message: "Supplier GlobalTech successfully renewed ISO 9001 certification.",
    type: "success",
    category: "node",
    icon: <CheckCircle className="h-5 w-5" />,
    timestamp: "45 minutes ago",
    read: true,
  },
  {
    id: "node-4",
    title: "Inventory Threshold",
    message: "Warehouse Node W7 inventory below safety stock. Current level: 15%.",
    type: "warning",
    category: "node",
    icon: <Package className="h-5 w-5" />,
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "node-5",
    title: "Equipment Maintenance",
    message: "Scheduled maintenance completed at Distribution Center DC2. Full operations resumed.",
    type: "info",
    category: "node",
    icon: <Wrench className="h-5 w-5" />,
    timestamp: "4 hours ago",
    read: true,
  },
  {
    id: "node-6",
    title: "New Supplier Onboarded",
    message: "Advanced Materials Ltd. successfully integrated into supply network.",
    type: "success",
    category: "node",
    icon: <Zap className="h-5 w-5" />,
    timestamp: "1 day ago",
    read: true,
  }
]

export function NotificationFeed() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("alerts")
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all")
  const [showMore, setShowMore] = useState(false)
  const { toast } = useToast()

  // Limit to 3 notifications initially
  const INITIAL_DISPLAY_COUNT = 3

  const handleMarkAsRead = (id: string) => {
    // In a real app, this would make an API call
    toast({
      title: "Marked as read",
      description: "Notification marked as read successfully",
    })
  }

  const handleMarkAllAsRead = () => {
    toast({
      title: "Success",
      description: "All notifications marked as read",
    })
  }

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
    }
  }

  const getNotificationBg = (type: NotificationType, read: boolean) => {
    if (read) return "bg-gradient-to-br from-white/90 via-slate-50/80 to-white/85 dark:bg-gradient-to-br dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-800/70"
    
    switch (type) {
      case "alert":
        return "bg-gradient-to-br from-red-50/90 via-red-100/70 to-pink-50/80 dark:bg-gradient-to-br dark:from-red-950/30 dark:via-slate-800/50 dark:to-red-950/30"
      case "warning":
        return "bg-gradient-to-br from-amber-50/90 via-yellow-100/70 to-orange-50/80 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-slate-800/50 dark:to-amber-950/30"
      case "info":
        return "bg-gradient-to-br from-blue-50/90 via-sky-100/70 to-cyan-50/80 dark:bg-gradient-to-br dark:from-blue-950/30 dark:via-slate-800/50 dark:to-blue-950/30"
      case "success":
        return "bg-gradient-to-br from-green-50/90 via-emerald-100/70 to-teal-50/80 dark:bg-gradient-to-br dark:from-green-950/30 dark:via-slate-800/50 dark:to-green-950/30"
    }
  }

  const getNotificationBorder = (type: NotificationType, read: boolean) => {
    if (read) return "border-slate-200/70 dark:border-slate-600/40"
    
    switch (type) {
      case "alert":
        return "border-red-200/80 dark:border-red-800/40"
      case "warning":
        return "border-amber-200/80 dark:border-amber-800/40"
      case "info":
        return "border-blue-200/80 dark:border-blue-800/40"
      case "success":
        return "border-green-200/80 dark:border-green-800/40"
    }
  }

  const getFilteredNotifications = (category: NotificationCategory) => {
    if (category === "all") return mockNotifications
    return mockNotifications.filter(notification => notification.category === category)
  }

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case "all":
        return "All Notifications"
      case "edge":
        return "Transport & Logistics"
      case "node":
        return "Nodes & Facilities"
    }
  }

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "all":
        return <BellIcon size={16} className="text-blue-500" />
      case "edge":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "node":
        return <Factory className="h-4 w-4 text-purple-500" />
    }
  }

  const renderNotificationList = () => {
    const notifications = getFilteredNotifications(selectedCategory)
    const displayNotifications = showMore 
      ? notifications 
      : notifications.slice(0, INITIAL_DISPLAY_COUNT)
    
    const hasMoreNotifications = notifications.length > INITIAL_DISPLAY_COUNT
    const unreadCount = notifications.filter(n => !n.read).length

    return (
      <div className="space-y-4">
        {/* Header with Filter Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-200"
                >
                  {getCategoryIcon(selectedCategory)}
                  <span className="text-sm font-medium">{getCategoryLabel(selectedCategory)}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <DropdownMenuLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Filter className="h-4 w-4" />
                  Filter Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedCategory === "all" && "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  )}
                >
                  <BellIcon size={16} className="text-blue-500" />
                  All Notifications
                  {selectedCategory === "all" && <CheckCircle className="ml-auto h-4 w-4 text-blue-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory("edge")}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedCategory === "edge" && "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                  )}
                >
                  <Truck className="h-4 w-4 text-blue-500" />
                  Transport & Logistics
                  {selectedCategory === "edge" && <CheckCircle className="ml-auto h-4 w-4 text-blue-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory("node")}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedCategory === "node" && "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                  )}
                >
                  <Factory className="h-4 w-4 text-purple-500" />
                  Nodes & Facilities
                  {selectedCategory === "node" && <CheckCircle className="ml-auto h-4 w-4 text-purple-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 bg-red-500 hover:bg-red-600 text-white text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <BellOff className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {displayNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400"
              >
                <BellOff className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">No notifications to display</p>
              </motion.div>
            ) : (
              displayNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:scale-[1.02] transform",
                    getNotificationBg(notification.type, notification.read),
                    getNotificationBorder(notification.type, notification.read),
                    "backdrop-blur-xl shadow-md shadow-black/5"
                  )}
                >
                  {/* Category Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={cn(
                      "rounded-full p-2.5 flex items-center justify-center shadow-lg ring-1 ring-white/30 dark:ring-slate-600/40",
                      notification.category === "edge" 
                        ? "bg-gradient-to-br from-blue-200 via-cyan-100 to-blue-300 dark:bg-gradient-to-br dark:from-blue-900/50 dark:via-slate-700/60 dark:to-blue-900/50 text-blue-700 dark:text-blue-300 shadow-blue-200/50 dark:shadow-blue-900/30"
                        : "bg-gradient-to-br from-purple-200 via-pink-100 to-purple-300 dark:bg-gradient-to-br dark:from-purple-900/50 dark:via-slate-700/60 dark:to-purple-900/50 text-purple-700 dark:text-purple-300 shadow-purple-200/50 dark:shadow-purple-900/30"
                    )}>
                      {notification.icon}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <p className="text-xs text-slate-500 dark:text-slate-400">{notification.timestamp}</p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{notification.message}</p>
                    <div className="pt-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
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

        {/* Show More Button */}
        {hasMoreNotifications && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white border-none shadow-lg shadow-blue-500/25 dark:shadow-blue-500/30 hover:shadow-blue-500/40 dark:hover:shadow-blue-500/50 transition-all duration-300 relative group"
            >
              <span className="absolute inset-0 rounded-md bg-blue-400/30 dark:bg-blue-400/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></span>
              <span className="absolute inset-0 rounded-md bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
              {showMore ? (
                <>
                  <span className="relative z-10">Show Less</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Show {getFilteredNotifications(selectedCategory).length - INITIAL_DISPLAY_COUNT} More</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Main Tab Navigation */}
      <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/40 shadow-lg rounded-lg p-1 flex space-x-1 w-fit mb-6">
        {[
          { id: "alerts" as MainTab, label: "Real-Time Alerts" },
          { id: "activity" as MainTab, label: "Recent Activity" }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveMainTab(tab.id)}
            className={`relative px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              activeMainTab === tab.id
                ? "text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeMainTab === tab.id && (
              <motion.div
                layoutId="activeMainTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-md shadow-lg shadow-blue-500/25 dark:shadow-blue-500/30"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeMainTab === "alerts" && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            {renderNotificationList()}
          </motion.div>
        )}
        {activeMainTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <RecentActivityList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
