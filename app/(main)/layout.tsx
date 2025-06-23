import type React from "react"
import type { Metadata } from "next"
import "../globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import AIChatOverlay from "@/components/ui/ai-chat-overlay"

export const metadata: Metadata = {
  title: "Intellisupply",
  description: "AI-powered platform for supply chain resilience planning and risk management",
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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




