"use client"

import { useState, useEffect } from "react"
import { Search, Bell, Moon, Sun, User, LogOut, Settings, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/components/toast-provider"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface TopNavProps {
  pageTitle: string
}

export function TopNav({ pageTitle }: TopNavProps) {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const unreadNotifications = state.notifications.filter((n) => !n.read)

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" })
    document.documentElement.classList.toggle("dark")
    addToast({
      type: "info",
      title: `${state.isDarkMode ? "Light" : "Dark"} mode enabled`,
      duration: 2000,
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })
  }

  const markNotificationAsRead = (notificationId: number) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: notificationId })
  }

  const clearAllNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" })
    addToast({
      type: "success",
      title: "All notifications cleared",
      duration: 2000,
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const searchInput = document.getElementById("global-search")
        searchInput?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full glass-effect shadow-lg shadow-black/5">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left Section: Sidebar Trigger & Page Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>

        {/* Global Search and Market Prices */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder="Search customers, orders, products... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 h-11 bg-white/50 dark:bg-slate-800/50 border-0 shadow-inner rounded-xl focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Market Prices */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/50">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-muted-foreground">Gold:</span>
              <span className="font-bold text-amber-600">$1,950/oz</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border border-gray-200/50 dark:border-gray-800/50">
              <span className="font-medium text-muted-foreground">Silver:</span>
              <span className="font-bold text-gray-600">$24.50/oz</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
              <span className="font-medium text-muted-foreground">USD Rate:</span>
              <span className="font-bold text-blue-600">12,700 UZS</span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-10 w-10 rounded-xl hover:bg-accent transition-all duration-300"
          >
            {state.isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-accent transition-all duration-300 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-slow">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {state.notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    Clear all
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {state.notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No notifications</div>
                ) : (
                  state.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 hover:bg-muted cursor-pointer ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div
                        className={`h-2 w-2 rounded-full mt-2 ${
                          notification.priority === "high"
                            ? "bg-red-500"
                            : notification.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{getTimeAgo(notification.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">john@jewelrystore.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  addToast({
                    type: "info",
                    title: "Logged out successfully",
                    description: "You have been signed out of your account",
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
