import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme"
import SessionProvider from "@/lib/context/SessionProvider";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col font-sans ${inter.className}`}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster position="top-right" />
            <SessionProvider />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}