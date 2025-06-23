import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme"
import SessionProvider from "@/lib/context/SessionProvider";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${geist.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
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