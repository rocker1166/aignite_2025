"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cog,
  Factory,
  Home,
  LineChart,
  Network,
  PanelLeft,
  Settings,
  ShieldAlert,
  Truck,
  User,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Check if we should auto-collapse based on URL params
  const shouldAutoCollapse = pathname === "/digital-twin" && searchParams.get("twinId")
  
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Auto-collapse when twinId is present in digital-twin page
  useEffect(() => {
    if (shouldAutoCollapse) {
      setIsCollapsed(true)
    }
  }, [shouldAutoCollapse])

  return (
    <div className={`flex ${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 ease-in-out`}>
      <Sidebar className={cn(
        "border-r-0 shadow-xl",
        isCollapsed ? "w-16" : "w-64",
        "bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl"
      )}>
        <SidebarHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5">
          <div className="flex items-center justify-between px-4 py-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
                    <ShieldAlert className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  <Link href="/" className="hover:opacity-80 transition-opacity">
                    Intellisupply
                  </Link>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
                  <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
                    <ShieldAlert className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="group relative p-2 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted to-muted/50 border border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 relative z-10 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronLeft className="h-4 w-4 relative z-10 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/dashboard">
                      <Home className={cn("h-4 w-4", pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/digital-twin"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/digital-twin" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/digital-twin">
                      <Network className={cn("h-4 w-4", pathname === "/digital-twin" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Digital Twin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/simulation"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/simulation" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/simulation">
                      <LineChart className={cn("h-4 w-4", pathname === "/simulation" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Simulation</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/analytics"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/analytics" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/analytics">
                      <BarChart3 className={cn("h-4 w-4", pathname === "/analytics" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Analytics</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/strategy"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/strategy" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/strategy">
                      <Settings className={cn("h-4 w-4", pathname === "/strategy" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Strategy</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-border/50 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === "/profile"}
                    className={cn(
                      "group relative mx-2 rounded-xl transition-all duration-200",
                      pathname === "/profile" 
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm text-primary" 
                        : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                    )}
                  >
                    <Link href="/profile">
                      <User className={cn("h-4 w-4", pathname === "/profile" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!isCollapsed && <span className="font-medium">Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className="group relative mx-2 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-[1.02]"
                  >
                    <Link href="/profile?tab=settings">
                      <Cog className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {!isCollapsed && <span className="font-medium">Settings</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {!isCollapsed && (
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-background/60 to-background/40 rounded-xl mx-2 mt-2 border border-border/30 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <div className="text-xs font-medium text-muted-foreground">v1.0.0</div>
              </div>
              <ThemeToggle />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}