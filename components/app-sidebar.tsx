"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Box,
  Brain,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle, SidebarThemeToggle } from "@/components/theme"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { state, open, setOpen } = useSidebar()
  
  // Check if we should auto-collapse based on URL params
  const shouldAutoCollapse = pathname === "/digital-twin" && searchParams.get("twinId")
  
  // Use the sidebar context state instead of local state
  const isCollapsed = state === "collapsed"

  // Auto-collapse when twinId is present in digital-twin page
  useEffect(() => {
    if (shouldAutoCollapse) {
      setOpen(false)
    }
  }, [shouldAutoCollapse, setOpen])

  const toggleSidebar = () => {
    setOpen(!open)
  }



  // Navigation items configuration
  const navigationItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", isActive: pathname === "/dashboard" },
    { href: "/orchestrator", icon: Brain, label: "MACG Orchestrator", isActive: pathname === "/orchestrator", badge: "NEW" },
    { href: "/digital-twin", icon: Network, label: "Digital Twin", isActive: pathname === "/digital-twin" },
    { href: "/simulation", icon: LineChart, label: "Simulation", isActive: pathname === "/simulation" },
    { href: "/strategy", icon: Settings, label: "Strategy", isActive: pathname === "/strategy" },
  ]

  const footerItems = [
    { href: "/profile", icon: User, label: "Profile", isActive: pathname === "/profile" },
  ]

  if (isCollapsed) {
    // Collapsed state - icon-only layout
    return (
      <TooltipProvider>
        <div className="w-16 h-screen flex flex-col bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-r shadow-xl">
          {/* Collapsed Header */}
          <div className="h-16 border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 flex items-center justify-center relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
                <ShieldAlert className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Collapsed Navigation */}
          <div className="flex-1 py-4 flex flex-col items-center space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                        item.isActive
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-sm"
                          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-105"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "h-4 w-4 transition-colors",
                          item.isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )} 
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* Theme Toggle - Above Footer */}
          <div className="px-4 pb-2">
            <SidebarThemeToggle variant="collapsed" />
          </div>

          {/* Collapsed Footer */}
          <div className="border-t border-border/50 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 p-4 space-y-2">
            {footerItems.map((item) => {
              const Icon = item.icon
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                        item.isActive
                          ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-sm"
                          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-sm hover:scale-105"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "h-4 w-4 transition-colors",
                          item.isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )} 
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Expanded state - full layout
  return (
    <Sidebar 
      className={cn(
        "border-r-0 shadow-2xl w-72 min-w-[16rem]",
        "bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ef] dark:from-[#181c24] dark:via-[#23283a] dark:to-[#181c24] backdrop-blur-2xl"
      )}
    >
      <SidebarHeader className="border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 shadow-md">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-md"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-2xl shadow-xl">
                <ShieldAlert className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="font-extrabold text-2xl tracking-tight">
              <Link href="/" className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent hover:from-primary hover:to-primary/80 transition-all duration-200">
                Intellisupply
              </Link>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-bold text-muted-foreground/90 uppercase tracking-widest mb-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                      className={cn(
                        "group relative mx-1 rounded-2xl px-3 py-2 flex items-center gap-3 transition-all duration-200 font-semibold text-base",
                        item.isActive
                          ? "bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-indigo-900/20 border border-primary/20 shadow-lg text-primary scale-[1.03]"
                          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-md hover:scale-[1.04]"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <span className={cn("flex items-center justify-center h-7 w-7 rounded-xl transition-colors", item.isActive ? "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 text-white shadow-md" : "bg-muted text-muted-foreground group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-700") }>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {footerItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={item.isActive}
                      className={cn(
                        "group relative mx-1 rounded-2xl px-3 py-2 flex items-center gap-3 transition-all duration-200 font-semibold text-base",
                        item.isActive
                          ? "bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-indigo-900/20 border border-primary/20 shadow-lg text-primary scale-[1.03]"
                          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 hover:shadow-md hover:scale-[1.04]"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <span className={cn("flex items-center justify-center h-7 w-7 rounded-xl transition-colors", item.isActive ? "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 text-white shadow-md" : "bg-muted text-muted-foreground group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-700") }>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-background/70 to-background/40 rounded-2xl mx-1 p-3 border border-border/30 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarThemeToggle />
          </div>
          <span className="text-xs text-muted-foreground/70 font-semibold">v2.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}