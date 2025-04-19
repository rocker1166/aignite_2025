"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export function LandingHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl">IntelliSupply</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
            Benefits
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/dashboard">Demo</Link>
          </Button>
          
          <Button asChild className="bg-blue-700 hover:bg-blue-800">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}