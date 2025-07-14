import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/store"
import { ToastProvider } from "@/components/toast-provider"
import { SidebarProvider } from "@/components/ui/sidebar" // Import SidebarProvider
import { cookies } from "next/headers" // Import cookies

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jewelry CRM - Professional Edition",
  description: "Complete jewelry business management system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true" // Read cookie for defaultOpen

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen`}>
        <AppProvider>
          <ToastProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              {" "}
              {/* Pass defaultOpen to SidebarProvider */}
              {children}
            </SidebarProvider>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
