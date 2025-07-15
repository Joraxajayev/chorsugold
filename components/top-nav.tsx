"use client"

import { useState, useEffect } from "react"
import { Search, Moon, Sun, User, LogOut, Settings, TrendingUp } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/components/toast-provider"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n"

const STORAGE_KEYS = {
  gold: "jewelryApp.goldPrice",
  usd: "jewelryApp.usdRate",
}

interface TopNavProps {
  pageTitle: string
}

export function TopNav({ pageTitle }: TopNavProps) {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()
  const { t } = useI18n()

  // 1) Initializing from localStorage (if available)
  const [goldPrice, setGoldPrice] = useState<number>(() => {
    if (typeof window === "undefined") return 1950
    const stored = localStorage.getItem(STORAGE_KEYS.gold)
    return stored !== null ? parseFloat(stored) : 1950
  })
  const [usdRate, setUsdRate] = useState<number>(() => {
    if (typeof window === "undefined") return 12700
    const stored = localStorage.getItem(STORAGE_KEYS.usd)
    return stored !== null ? parseInt(stored, 10) : 12700
  })

  // 2) Sync to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.gold, String(goldPrice))
  }, [goldPrice])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.usd, String(usdRate))
  }, [usdRate])

  const [searchQuery, setSearchQuery] = useState("")
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

  // Navigate to search on "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        document.getElementById("global-search")?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full glass-effect shadow-lg shadow-black/5">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Sidebar & Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>

        {/* Search & Market */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="global-search"
              placeholder={t("common.search") + " customers, orders, products... (Press /)"}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 h-11 bg-white/50 dark:bg-slate-800/50 border-0 shadow-inner rounded-xl focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Market Prices */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {/* Gold */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/50">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-muted-foreground">Gold:</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={goldPrice}
                onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                className="w-20 bg-transparent border-none focus:ring-0 font-bold text-amber-600 text-right"
              />
              <span className="font-medium text-amber-600">$/oz</span>
            </div>

            {/* USD Rate */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
              <span className="font-medium text-muted-foreground">USD Rate:</span>
              <input
                type="number"
                min="0"
                step="1"
                value={usdRate}
                onChange={(e) => setUsdRate(parseInt(e.target.value, 10) || 0)}
                className="w-24 bg-transparent border-none focus:ring-0 font-bold text-blue-600 text-right"
              />
              <span className="font-medium text-blue-600">UZS</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-10 w-10 rounded-xl hover:bg-accent transition">
            {state.isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

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
