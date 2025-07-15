import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/store"
import { ToastProvider } from "@/components/toast-provider"
import { SidebarProvider } from "@/components/ui/sidebar" // Import SidebarProvider
import { cookies } from "next/headers" // Import cookies
// Add I18nProvider import
import { I18nProvider } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chorsu Gold - Professional Jewelry",
  description: "Complete jewelry business management system",
}

// Wrap the existing providers with I18nProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen`}>
        <I18nProvider>
          <AppProvider>
            <ToastProvider>
              <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
            </ToastProvider>
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
