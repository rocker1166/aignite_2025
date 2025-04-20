"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Bell, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabaseClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/stores/user"
import { formatDistanceToNow } from "date-fns"

interface Source {
    name: string
    url: string
}

interface Notification {
    id: string
    title: string
    message: string
    severity: string
    created_at: string
    read_status: boolean
    notifications_type?: string
    citations?: Source[]
}

// Helper function to get severity badge color
const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
        case "high":
            return "bg-destructive text-destructive-foreground"
        case "medium":
            return "bg-amber-500 text-white"
        case "low":
            return "bg-green-500 text-white"
        default:
            return "bg-primary text-primary-foreground"
    }
}

// Helper function to truncate URL for display
const truncateUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        // Just display the hostname without the full URL
        return urlObj.hostname;
    } catch (e) {
        // Fallback to basic truncation if URL parsing fails
        return url.length > 15 ? url.substring(0, 15) + '...' : url;
    }
}

// Helper function to truncate tooltip content
const truncateTooltipContent = (source: Source) => {
    try {
        const urlObj = new URL(source.url);
        return `${source.name}: ${urlObj.hostname}`;
    } catch (e) {
        // Simple fallback
        return `${source.name}: ${source.url.substring(0, 30)}${source.url.length > 30 ? '...' : ''}`;
    }
}

export function SupplyChainNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const { userData } = useUser()
    const userId = userData?.id

    // Extract fetchNotifications function so it can be reused
    const fetchNotifications = async () => {
        if (!userId) return

        try {
            setLoading(true)
            setRefreshing(true)

            // Fetch initial notifications
            const { data, error } = await supabaseClient
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(10)

            if (error) {
                console.error("Error fetching notifications:", error)
                return
            }

            setNotifications(data || [])
        } catch (err) {
            console.error("Failed to fetch notifications:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Handle refresh button click
    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent dropdown from closing
        fetchNotifications()
    }

    useEffect(() => {
        // Only fetch notifications if we have a user ID
        if (!userId) return

        // Initial fetch
        fetchNotifications()

        // Set up real-time subscription
        const subscription = supabaseClient
            .channel("notifications_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    // Add the new notification to the state
                    setNotifications((prev) => [payload.new as Notification, ...prev])
                },
            )
            .subscribe()

        // Clean up subscription
        return () => {
            subscription.unsubscribe()
        }
    }, [userId])

    // Mark notifications as read when dropdown is opened
    useEffect(() => {
        const markNotificationsAsRead = async () => {
            if (!isOpen || !userId) return

            const unreadNotifications = notifications.filter((n) => !n.read_status).map((n) => n.id)
            if (unreadNotifications.length === 0) return

            try {
                const { error } = await supabaseClient
                    .from("notifications")
                    .update({ read_status: true })
                    .in("notification_id", unreadNotifications)

                if (error) {
                    console.error("Error marking notifications as read:", error)
                    return
                }

                // Update local state
                setNotifications((prev) =>
                    prev.map((n) => (unreadNotifications.includes(n.id) ? { ...n, read_status: true } : n)),
                )
            } catch (err) {
                console.error("Failed to mark notifications as read:", err)
            }
        }

        markNotificationsAsRead()
    }, [isOpen, userId, notifications])

    // Format the created_at date to a readable time format
    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
        } catch (error) {
            return "Unknown time"
        }
    }

    // Get sources from citations
    const getSources = (notification: Notification) => {
        // Try to get sources from citations
        if (notification.citations && Array.isArray(notification.citations)) {
            return notification.citations
        }
        return []
    }

    // Display a single source badge with a tooltip
    const SourceBadge = ({ source, index }: { source: Source; index: number }) => (
        <Tooltip key={index}>
            <TooltipTrigger asChild>
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                    <Badge variant="outline" className="h-5 px-1 text-[10px] flex items-center gap-0.5 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {truncateUrl(source.url)}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </Badge>
                </a>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs p-1 max-w-[200px] break-words">
                {truncateTooltipContent(source)}
            </TooltipContent>
        </Tooltip>
    )

    // Handle case when there are no sources
    const renderSources = (notification: Notification) => {
        const sources = getSources(notification)

        if (sources.length === 0) {
            return (
                <Badge variant="outline" className="h-5 px-1 text-[10px]">
                    No source
                </Badge>
            )
        }

        // Only show up to 2 sources in the UI to avoid overflow
        return (
            <div className="flex gap-1 flex-wrap">
                {sources.slice(0, 2).map((source, index) => (
                    <SourceBadge key={`source-${notification.id}-${index}`} source={source} index={index} />
                ))}
                {sources.length > 2 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="h-5 px-1 text-[10px]">
                                +{sources.length - 2} more
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs p-1 max-w-[200px]">
                            {sources
                                .slice(2)
                                .map((s) => s.name)
                                .join(", ")}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        )
    }

    return (
        <TooltipProvider>
            <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        {notifications.filter((n) => !n.read_status).length > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                {notifications.filter((n) => !n.read_status).length}
                            </Badge>
                        )}
                        <span className="sr-only">Supply Chain Alerts</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-w-[90vw]">
                    <div className="flex items-center justify-between py-1.5 px-2">
                        <DropdownMenuLabel className="py-0">Supply Chain Alerts</DropdownMenuLabel>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRefresh} disabled={refreshing}>
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                    <span className="sr-only">Refresh notifications</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">Refresh notifications</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center py-4">Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="flex flex-col items-start py-2 px-3 cursor-default focus:bg-accent w-full"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="font-medium text-sm truncate max-w-[65%]">{notification.title}</div>
                                        <Badge className={`ml-auto text-[10px] px-1.5 py-0 h-4 ${getSeverityColor(notification.severity)}`}>
                                            {notification.severity}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 break-words w-full">
                                        {notification.message}
                                    </div>

                                    <div className="flex items-center justify-between w-full mt-1 flex-wrap gap-1">
                                        <div className="text-[10px] text-muted-foreground">{formatTime(notification.created_at)}</div>
                                        <div className="flex-shrink-0">
                                            {renderSources(notification)}
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="flex justify-center items-center text-sm text-muted-foreground py-4">
                                No notifications
                            </div>
                        )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer justify-center text-xs py-1.5">View all alerts</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    )
}