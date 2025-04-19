import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import SessionProvider from "@/lib/context/SessionProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <SessionProvider/>
        </ThemeProvider>
      </body>
    </html>
  );
}