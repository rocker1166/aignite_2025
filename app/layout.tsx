import type React from "react"
import "./globals.css"
import { UserProvider } from "@/lib/context/UserContext";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
