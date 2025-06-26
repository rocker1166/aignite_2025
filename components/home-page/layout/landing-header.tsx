"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import SignoutButton from "@/components/auth/Signout";
import { useUser } from "@/lib/stores/user";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function LandingHeader() {
  const setUser = useUser((state) => state.setUserData);
  

  // const { theme, setTheme } = useTheme();
  const { userData } = useUser();
  

  // Refresh user data when component mounts
  useEffect(() => {
    setUser();
  }, [userData, setUser]);

  return (
    <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
              <ShieldAlert className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-primary hover:to-primary/80 transition-all duration-200">IntelliSupply</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#benefits"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Benefits
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle start="top-right" />
            <div>
              {userData ? (
                <SignoutButton />
              ) : (
                <Link href="/signin" className="text-sm font-medium">
                  Sign In
                </Link>
              )}
            </div>
         


          <Button asChild className="bg-blue-700 hover:bg-blue-800">
            <Link href="/dashboard" prefetch={true}>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}