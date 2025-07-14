"use client"

import { useState } from "react"
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Gem,
  Hammer,
  Bell,
  ChevronDown,
  Calendar,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
]

const businessMenuItems = [
  {
    title: "Orders",
    icon: ShoppingCart,
    subItems: [
      { title: "All Orders", url: "/orders", icon: FileText },
      { title: "Pending", url: "/orders?status=pending", icon: Clock },
      { title: "In Progress", url: "/orders?status=progress", icon: Zap },
      { title: "Completed", url: "/orders?status=completed", icon: CheckCircle },
    ],
  },
  {
    title: "Returns",
    icon: RotateCcw,
    subItems: [
      { title: "All Returns", url: "/returns", icon: RotateCcw },
      { title: "Pending", url: "/returns?status=pending", icon: Clock },
      { title: "Approved", url: "/returns?status=approved", icon: CheckCircle },
      { title: "Refunded", url: "/returns?status=refunded", icon: DollarSign },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    subItems: [
      { title: "Products", url: "/inventory", icon: Package },
      { title: "Raw Materials", url: "/materials", icon: Gem },
      { title: "Stock Adjustments", url: "/inventory/adjustments", icon: Settings },
    ],
  },
  {
    title: "Production",
    icon: Hammer,
    subItems: [
      { title: "Craftsmen", url: "/craftsmen", icon: Users },
      { title: "Work Assignments", url: "/assignments", icon: Calendar },
      { title: "Quality Control", url: "/quality", icon: CheckCircle },
    ],
  },
  {
    title: "Models",
    icon: Gem,
    subItems: [
      { title: "General Base", url: "/models", icon: Gem },
      { title: "Categories", url: "/models/categories", icon: FileText },
      { title: "Templates", url: "/models/templates", icon: Settings },
    ],
  },
]

const analyticsMenuItems = [

  
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

const systemMenuItems = [
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { state } = useAppStore()
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>(["business"])

  const unreadNotifications = state.notifications.filter((n) => !n.read).length
  const activeOrders = state.orders.filter((o) => o.status === "In Progress" || o.status === "Order Received").length

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const isActiveLink = (url: string) => {
    if (url === "/") return pathname === "/"
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="border-r z-40 bg-background" collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-6 glass-effect sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/25">
              <Gem className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse-slow"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl gradient-text">Chorsu Gold</span>
            <span className="text-xs text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">
              Professional Jewelry
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink(item.url)}
                    className="sidebar-item h-12 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.title === "Customers" && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {state.customers.length}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="my-4 mx-3" />
        {/* Business Operations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {businessMenuItems.map((item) => (
                <Collapsible
                  key={item.title}
                  open={openSections.includes("business")}
                  onOpenChange={() => toggleSection("business")}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="sidebar-item h-12 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group w-full">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          {item.title === "Orders" && activeOrders > 0 && (
                            <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">
                              {activeOrders}
                            </Badge>
                          )}
                          <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <SidebarMenu className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton
                              asChild
                              size="sm"
                              isActive={isActiveLink(subItem.url)}
                              className="h-8 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                            >
                              <Link href={subItem.url} className="flex items-center gap-2">
                                {subItem.icon && <subItem.icon className="h-3 w-3" />}
                                <span className="text-sm">{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="my-4 mx-3" />
        {/* Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {analyticsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink(item.url)}
                    className="sidebar-item h-12 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="my-4 mx-3" />
        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveLink(item.url)}
                    className="sidebar-item h-12 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group"
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.title === "Notifications" && unreadNotifications > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs animate-pulse-slow">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-6 glass-effect sticky bottom-0 z-50">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">System Online</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
