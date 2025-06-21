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

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Check if we should auto-collapse based on URL params
  const shouldAutoCollapse = pathname === "/digital-twin" && searchParams.get("twinId")
  
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-collapse when twinId is present in digital-twin page
  useEffect(() => {
    if (shouldAutoCollapse) {
      setIsCollapsed(true)
    }
  }, [shouldAutoCollapse])

  return (
    <div className={`flex ${isCollapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <Sidebar className={isCollapsed ? "w-16" : "w-64"}>
        <SidebarHeader>
          <div className="flex items-center justify-between px-4 py-2">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
                <div className="font-semibold text-lg">
                  <Link href="/">Intellisupply</Link>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded hover:bg-muted"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          {!isCollapsed && (
            <div className="px-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Box className="mr-2 h-4 w-4" />
                <span className="truncate">Global Supply Chain</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/"}>
                    <Link href="/dashboard">
                      <Home className="h-4 w-4" />
                      {!isCollapsed && <span>Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/digital-twin"}>
                    <Link href="/digital-twin">
                      <Network className="h-4 w-4" />
                      {!isCollapsed && <span>Digital Twin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/simulation"}>
                    <Link href="/simulation">
                      <LineChart className="h-4 w-4" />
                      {!isCollapsed && <span>Simulation</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/analytics"}>
                    <Link href="/analytics">
                      <BarChart3 className="h-4 w-4" />
                      {!isCollapsed && <span>Analytics</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/strategy"}>
                    <Link href="/strategy">
                      <Settings className="h-4 w-4" />
                      {!isCollapsed && <span>Strategy</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                    <Link href="/profile">
                      <User className="h-4 w-4" />
                      {!isCollapsed && <span>Profile</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/profile?tab=settings">
                      <Cog className="h-4 w-4" />
                      {!isCollapsed && <span>Settings</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {!isCollapsed && (
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">v1.0.0</div>
              <ThemeToggle />
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}