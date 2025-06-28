"use client"

import type React from "react"
import "../globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import AIChatOverlay from "@/components/ui/ai-chat-overlay"
import { supabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        
        if (authError || !user) {
          router.push('/signin')
          return
        }

        setIsAuthenticated(true)

        // Check if user has all required profile fields
        const { data: userData, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (userData && (
          !userData.organisation_name || userData.organisation_name.trim() === '' ||
          !userData.location || userData.location.trim() === '' ||
          !userData.industry || userData.industry.trim() === '' ||
          !userData.sub_industry || userData.sub_industry.trim() === '' ||
          !userData.description || userData.description.trim() === ''
        )) {
          router.push('/profile?show_popup=true')
          return
        }

      } catch (error) {
        router.push('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' ){
          router.push('/')
        }else if(!session) {
          router.push('/signin')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to signin
  }
  return (
    <div className={`h-full w-full`}>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 min-h-0 flex flex-col overflow-auto bg-background">
            {children}
          </main>
        </div>

        <Toaster />
      </SidebarProvider>

      {/* Add AI Chat Overlay */}
      {/* <AIChatOverlay /> */}
    </div>
  )
}




