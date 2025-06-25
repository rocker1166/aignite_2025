"use client"

import { Search, User } from "lucide-react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BellIcon } from "@/components/icons"

// Animation variants for dropdown content
const dropdownContent: Variants = {
  hidden: {
    clipPath: 'inset(10% 50% 90% 50% round 12px)',
    opacity: 0,
    scale: 0.95,
  },
  show: {
    clipPath: 'inset(0% 0% 0% 0% round 12px)',
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4,
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
  exit: {
    clipPath: 'inset(10% 50% 90% 50% round 12px)',
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  }
}

const dropdownItem: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
  },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    }
  },
}

interface HeaderProps {
  title: string
}

/**
 * Renders a sticky top navigation header with a title, sidebar trigger, notifications dropdown, and user account menu.
 *
 * @param title - The text to display as the header title.
 */
export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b g-background-100/70 dark:bg-[#232325]/70 backdrop-blur-md shadow-sm px-6">
       
      <SidebarTrigger />
      <div className="font-semibold text-lg">{title}</div>
      <div className="ml-auto flex items-center gap-4">
        
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <BellIcon size={16} />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80" asChild>
            <motion.div
              variants={dropdownContent}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <motion.div variants={dropdownItem}>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1 w-full text-left">
                      <div className="font-medium">Simulation Complete</div>
                      <div className="text-xs text-muted-foreground">
                        Your simulation "Port Strike Scenario" has completed.
                      </div>
                      <div className="text-xs text-muted-foreground">5 minutes ago</div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={dropdownItem}>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1 w-full text-left">
                      <div className="font-medium">Risk Alert</div>
                      <div className="text-xs text-muted-foreground">
                        High risk detected in Southeast Asia region.
                      </div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={dropdownItem}>
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1 w-full text-left">
                      <div className="font-medium">New Strategy Available</div>
                      <div className="text-xs text-muted-foreground">
                        AI has generated a new resilience strategy for your supply chain.
                      </div>
                      <div className="text-xs text-muted-foreground">3 hours ago</div>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              </div>
              <DropdownMenuSeparator />
              <motion.div variants={dropdownItem}>
                <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                  View all notifications
                </DropdownMenuItem>
              </motion.div>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {/* <AvatarImage src="/placeholder-user.jpg" alt="User" /> */}
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" asChild>
            <motion.div
              variants={dropdownContent}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <motion.div variants={dropdownItem}>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
              </motion.div>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
