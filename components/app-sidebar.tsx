"use client"

import type * as React from "react"
import { Users, ShoppingCart, Package, Gem, RotateCcw, BarChart3, Settings, Home, ChevronUp, User2 } from 'lucide-react'
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"

const data = {
  navMain: [
    {
      title: "nav.dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "nav.customers",
      url: "/customers",
      icon: Users,
    },
    {
      title: "nav.orders",
      url: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "nav.returns",
      url: "/returns",
      icon: RotateCcw,
    },
    {
      title: "nav.inventory",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "nav.models",
      url: "/models",
      icon: Gem,
    },
    {
      title: "nav.reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "nav.settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18n()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                
                <div className="size-8 aspect-square rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center">
              <Gem className="size-4 text-white" />
            </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Chorsu Gold</span>
                  <span className="truncate text-xs">Professional Jewelry</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.main")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <IconComponent />
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-6 glass-effect sticky bottom-0 z-50">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-slow"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{("System Online")}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
