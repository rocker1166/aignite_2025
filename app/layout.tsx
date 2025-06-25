import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme"
import SessionProvider from "@/lib/context/SessionProvider";
import { Toaster } from "sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Poppins } from 'next/font/google'
import { CopilotKit } from "@copilotkit/react-core"; 


const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

/**
 * Root layout component that sets up global providers, theming, font, and integrations for the application.
 *
 * Wraps the application with theme management, session context, CopilotKit integration, toast notifications, and applies the Poppins font and dark mode styling.
 *
 * @param children - The content to be rendered within the layout
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CopilotKit publicApiKey="copilotkit-1234567890"> 
            {children}
            </CopilotKit>
            <Toaster position="top-right" />
            <SessionProvider />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}