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
  const { userData } = useUser();

  // Smooth scroll function with easing
  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    // Get header height for offset
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Calculate positions accounting for header height
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    
    // Longer duration for smoother scroll
    const duration = 1500;
    let start: number | null = null;

    // Enhanced easing function for smoother animation
    const easeOutQuint = (t: number): number => {
      return 1 - Math.pow(1 - t, 5);
    };

    // Animation function
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Apply easing
      const easeProgress = easeOutQuint(progress);
      
      // Smooth scroll with easing
      window.scrollTo({
        top: startPosition + (distance * easeProgress),
        behavior: 'auto' // Use 'auto' to prevent competing with CSS smooth scroll
      });
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Refresh user data when component mounts
  useEffect(() => {
    setUser();
  }, [userData, setUser]);

  return (
    <header className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a 
          href="#top" 
          onClick={(e) => smoothScroll(e, 'top')}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-lg">
              <ShieldAlert className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-primary hover:to-primary/80 transition-all duration-200">IntelliSupply</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            onClick={(e) => smoothScroll(e, 'features')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#benefits"
            onClick={(e) => smoothScroll(e, 'benefits')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Benefits
          </a>
          <a
            href="#contact"
            onClick={(e) => smoothScroll(e, 'contact')}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contact
          </a>
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