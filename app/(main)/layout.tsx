import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import AIChatOverlay from "@/components/ui/ai-chat-overlay"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Intellisupply",
  description: "AI-powered platform for supply chain resilience planning and risk management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Add any head elements here */}
      </head>
      <body className={`${inter.className} min-h-screen w-full bg-background`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
          <AIChatOverlay />
        </ThemeProvider>
      </body>
    </html>
  )
}




