import { supabaseClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types/database"

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabaseClient
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }

  return data || []
}

export async function createNotification(notification: Partial<Notification>): Promise<Notification> {
  const { data, error } = await supabaseClient.from("notifications").insert(notification).select().single()

  if (error) {
    console.error("Error creating notification:", error)
    throw error
  }

  return data
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabaseClient
    .from("notifications")
    .update({ read_status: true })
    .eq("notification_id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabaseClient
    .from("notifications")
    .update({ read_status: true })
    .eq("user_id", userId)
    .eq("read_status", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}
