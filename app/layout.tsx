import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme"
import SessionProvider from "@/lib/context/SessionProvider";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`} suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col font-sans ${poppins.className}`}>
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