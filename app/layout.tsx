import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme"
import SessionProvider from "@/lib/context/SessionProvider";
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Poppins } from 'next/font/google'
import { CopilotProvider } from "@/components/copilot/copilot-provider";
import "@copilotkit/react-textarea/styles.css";
import { ErrorBoundary } from "@/components/error-boundary";

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <CopilotProvider> 
                {children}
              </CopilotProvider>
              <Toaster position="top-right" richColors />
              <SessionProvider />
            </ThemeProvider>
          </NuqsAdapter>
        </ErrorBoundary>
      </body>
    </html>
  );
}