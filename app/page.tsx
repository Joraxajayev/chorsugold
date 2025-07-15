"use client"

import { useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SidebarProvider } from "@/components/ui/sidebar" // Removed SidebarInset import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/components/toast-provider"

// Add useI18n hook and translate dashboard content
import { useI18n } from "@/lib/i18n"

export default function Dashboard() {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()
  const { t } = useI18n()

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const totalCustomers = state.customers.length
    const activeOrders = state.orders.filter((o) => o.status === "In Progress" || o.status === "Order Received").length
    const completedOrders = state.orders.filter((o) => o.status === "Completed").length
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const inventoryValue = state.inventory.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
    const lowStockItems = state.inventory.filter((item) => item.quantity <= item.minStock).length

    return {
      totalCustomers,
      activeOrders,
      completedOrders,
      totalRevenue,
      inventoryValue,
      lowStockItems,
    }
  }, [state.customers, state.orders, state.inventory])

  // Recent activity based on actual data
  const recentActivity = useMemo(() => {
    const activities = []

    // Add recent orders
    state.orders
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 2)
      .forEach((order) => {
        activities.push({
          id: `order-${order.id}`,
          type: "order",
          title: "Order received",
          description: `${order.product} from ${order.customer}`,
          time: new Date(order.orderDate).toLocaleDateString(),
          icon: ShoppingCart,
          color: "text-blue-500",
        })
      })

    // Add recent customers
    state.customers
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 1)
      .forEach((customer) => {
        activities.push({
          id: `customer-${customer.id}`,
          type: "customer",
          title: "New customer",
          description: `${customer.name} joined as ${customer.status.toLowerCase()} customer`,
          time: new Date(customer.joinDate).toLocaleDateString(),
          icon: Users,
          color: "text-green-500",
        })
      })

    // Add low stock alerts
    if (metrics.lowStockItems > 0) {
      activities.push({
        id: "low-stock",
        type: "inventory",
        title: "Low stock alert",
        description: `${metrics.lowStockItems} items need restocking`,
        time: "Today",
        icon: AlertTriangle,
        color: "text-red-500",
      })
    }

    return activities.slice(0, 4)
  }, [state.orders, state.customers, metrics.lowStockItems])

  // Inventory composition
  const inventoryComposition = useMemo(() => {
    const goldItems = state.inventory.filter((item) => item.material.toLowerCase().includes("gold"))
    const silverItems = state.inventory.filter((item) => item.material.toLowerCase().includes("silver"))
    const gemstoneItems = state.inventory.filter((item) => item.material.toLowerCase().includes("diamond"))

    const goldValue = goldItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
    const silverValue = silverItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
    const gemstoneValue = gemstoneItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)

    const total = goldValue + silverValue + gemstoneValue || 1

    return [
      {
        material: "Gold",
        value: goldValue,
        percentage: Math.round((goldValue / total) * 100),
        color: "bg-amber-500",
      },
      {
        material: "Silver",
        value: silverValue,
        percentage: Math.round((silverValue / total) * 100),
        color: "bg-gray-400",
      },
      {
        material: "Gemstones",
        value: gemstoneValue,
        percentage: Math.round((gemstoneValue / total) * 100),
        color: "bg-purple-500",
      },
    ]
  }, [state.inventory])

  const handleQuickAction = (action: string) => {
    addToast({
      type: "info",
      title: `${action} clicked`,
      description: `Navigate to ${action.toLowerCase()} page`,
      duration: 2000,
    })
  }

  const handleRestockAlert = () => {
    addToast({
      type: "success",
      title: "Restock reminder set",
      description: "You'll be notified when it's time to reorder",
      duration: 3000,
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav pageTitle="Dashboard" />
        <main className="flex-1 overflow-auto px-6 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            {/* Update the welcome section */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                {/* Update all card titles and content */}
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.totalCustomers")}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
              <div className="text-3xl font-bold text-foreground">
  790.19 <span className="text-base text-muted-foreground">gr</span>
</div>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12%</span>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                {/* Update all card titles and content */}
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.activeOrders")}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics.activeOrders}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span>{metrics.completedOrders} completed this month</span>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                {/* Update all card titles and content */}
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.inventoryValue")}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${metrics.inventoryValue.toLocaleString()}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  {metrics.lowStockItems > 0 ? (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">{metrics.lowStockItems} low stock</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">All items in stock</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                {/* Update all card titles and content */}
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.totalRevenue")}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">${metrics.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8.2%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Charts and Activity */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Orders Chart Placeholder */}
            <Card className="lg:col-span-2 card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-4">
                {/* Update chart and activity section titles */}
                <CardTitle className="text-xl font-bold">{t("dashboard.ordersOverview")}</CardTitle>
                <CardDescription className="text-muted-foreground">Order trends over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">Interactive Chart</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {metrics.activeOrders} active orders, {metrics.completedOrders} completed
                  </p>
                  <div className="flex gap-2">
                    {[8, 12, 6, 16, 10, 14, 8].map((height, index) => (
                      <div
                        key={index}
                        className={`w-3 bg-gradient-to-t from-primary to-primary/70 rounded-full transition-all duration-500 hover:from-primary/70 hover:to-primary`}
                        style={{ height: `${height * 4}px` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                {/* Update chart and activity section titles */}
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
                <CardDescription>Latest updates from your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                        <activity.icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Inventory Composition and Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inventory Composition */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                {/* Update chart and activity section titles */}
                <CardTitle>{t("dashboard.inventoryComposition")}</CardTitle>
                <CardDescription>Breakdown of inventory by material type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryComposition.map((item) => (
                    <div key={item.material} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${item.color}`} />
                          <span>{item.material}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${item.value.toLocaleString()}</span>
                          <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Alerts */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                {/* Update chart and activity section titles */}
                <CardTitle>{t("dashboard.quickActions")}</CardTitle>
                <CardDescription>Important tasks and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Alerts */}
                <div className="space-y-3">
                  {metrics.lowStockItems > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Low Stock Alert</p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {metrics.lowStockItems} items need restocking
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 bg-transparent"
                        onClick={handleRestockAlert}
                      >
                        Restock
                      </Button>
                    </div>
                  )}

                  {metrics.activeOrders > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Orders</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {metrics.activeOrders} orders in progress
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 bg-transparent"
                        onClick={() => handleQuickAction("View Orders")}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent hover:bg-muted"
                    onClick={() => handleQuickAction("Add Customer")}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Add Customer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent hover:bg-muted"
                    onClick={() => handleQuickAction("New Order")}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-xs">New Order</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent hover:bg-muted"
                    onClick={() => handleQuickAction("Add Product")}
                  >
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Add Product</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent hover:bg-muted"
                    onClick={() => handleQuickAction("View Reports")}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
