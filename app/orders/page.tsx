"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Clock, CheckCircle, AlertCircle, User } from "lucide-react"
import { useAppStore, type Order } from "@/lib/store"
import { useToast } from "@/components/toast-provider"

const craftsmen = [
  { id: 1, name: "John Smith", specialty: "Diamond Setting" },
  { id: 2, name: "Maria Garcia", specialty: "Repairs & Restoration" },
  { id: 3, name: "David Wilson", specialty: "Custom Design" },
  { id: 4, name: "Lisa Chen", specialty: "Engraving" },
]

export default function OrdersPage() {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState({
    customer: "",
    customerId: 0,
    product: "",
    description: "",
    craftsman: "",
    priority: "Medium" as Order["priority"],
    totalAmount: 0,
    orderDate: "",
    dueDate: "",
  })

  const filteredOrders = useMemo(() => {
    return state.orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [state.orders, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      customer: "",
      customerId: 0,
      product: "",
      description: "",
      craftsman: "",
      priority: "Medium",
      totalAmount: 0,
      orderDate: "",
      dueDate: "",
    })
  }

  const handleAddOrder = () => {
    if (
      !formData.customer ||
      !formData.product ||
      !formData.orderDate ||
      !formData.dueDate ||
      formData.totalAmount <= 0
    ) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields and ensure amount is positive.",
      })
      return
    }

    const customer = state.customers.find((c) => c.name === formData.customer)
    if (!customer) {
      addToast({
        type: "error",
        title: "Customer Not Found",
        description: "Please select an existing customer.",
      })
      return
    }

    const newOrder: Order = {
      id: Math.max(...state.orders.map((o) => o.id), 0) + 1,
      orderNumber: `ORD-${(Math.max(...state.orders.map((o) => o.id), 0) + 1).toString().padStart(3, "0")}`,
      customer: formData.customer,
      customerId: customer.id,
      product: formData.product,
      craftsman: formData.craftsman,
      status: "Order Received",
      priority: formData.priority,
      orderDate: formData.orderDate,
      dueDate: formData.dueDate,
      totalAmount: formData.totalAmount,
      description: formData.description,
    }

    dispatch({ type: "ADD_ORDER", payload: newOrder })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: Date.now(),
        type: "order",
        title: "New order created",
        message: `Order ${newOrder.orderNumber} for ${newOrder.customer} received.`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "high",
      },
    })

    addToast({
      type: "success",
      title: "Order Created",
      description: `Order ${newOrder.orderNumber} has been successfully created.`,
    })

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditOrder = () => {
    if (
      !selectedOrder ||
      !formData.customer ||
      !formData.product ||
      !formData.orderDate ||
      !formData.dueDate ||
      formData.totalAmount <= 0
    ) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields and ensure amount is positive.",
      })
      return
    }

    const customer = state.customers.find((c) => c.name === formData.customer)
    if (!customer) {
      addToast({
        type: "error",
        title: "Customer Not Found",
        description: "Please select an existing customer.",
      })
      return
    }

    const updatedOrder: Order = {
      ...selectedOrder,
      customer: formData.customer,
      customerId: customer.id,
      product: formData.product,
      description: formData.description,
      craftsman: formData.craftsman,
      priority: formData.priority,
      totalAmount: formData.totalAmount,
      orderDate: formData.orderDate,
      dueDate: formData.dueDate,
    }

    dispatch({ type: "UPDATE_ORDER", payload: updatedOrder })

    addToast({
      type: "success",
      title: "Order Updated",
      description: `Order ${updatedOrder.orderNumber} has been successfully updated.`,
    })

    setIsEditDialogOpen(false)
    setSelectedOrder(null)
    resetForm()
  }

  const handleDeleteOrder = () => {
    if (!selectedOrder) return

    dispatch({ type: "DELETE_ORDER", payload: selectedOrder.id })

    addToast({
      type: "success",
      title: "Order Deleted",
      description: `Order ${selectedOrder.orderNumber} has been removed.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedOrder(null)
  }

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order)
    setFormData({
      customer: order.customer,
      customerId: order.customerId,
      product: order.product,
      description: order.description,
      craftsman: order.craftsman,
      priority: order.priority,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      dueDate: order.dueDate,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Order Received":
        return <Clock className="h-4 w-4" />
      case "In Progress":
        return <AlertCircle className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Order Received":
        return "secondary"
      case "In Progress":
        return "default"
      case "Completed":
        return "success" // Assuming a 'success' variant for Badge
      case "Delivered":
        return "outline"
      default:
        return "secondary"
    }
  }

  const totalOrdersCount = state.orders.length
  const inProgressOrders = state.orders.filter((o) => o.status === "In Progress").length
  const completedOrders = state.orders.filter((o) => o.status === "Completed").length
  const totalOrdersValue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <SidebarProvider>
      
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav pageTitle="Orders & Project Management" />
          <main className="flex-1 overflow-auto px-4 py-4">
            {" "}
            {/* Changed p-4 to px-4 py-4 */}
            {/* Order Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrdersCount}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{inProgressOrders}</div>
                  <p className="text-xs text-muted-foreground">Active projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{completedOrders}</div>
                  <p className="text-xs text-muted-foreground">Ready for delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalOrdersValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active orders value</p>
                </CardContent>
              </Card>
            </div>
            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Order Received">Order Received</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>Register a new jewelry order or project.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customer">
                          Customer <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.customer}
                          onValueChange={(value) => setFormData({ ...formData, customer: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {state.customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="product">
                          Product/Service <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="product"
                          placeholder="e.g., Custom Ring"
                          value={formData.product}
                          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the work required..."
                        className="min-h-[80px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="craftsman">Assign Craftsman</Label>
                        <Select
                          value={formData.craftsman}
                          onValueChange={(value) => setFormData({ ...formData, craftsman: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select craftsman" />
                          </SelectTrigger>
                          <SelectContent>
                            {craftsmen.map((craftsman) => (
                              <SelectItem key={craftsman.id} value={craftsman.name}>
                                {craftsman.name} - {craftsman.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: Order["priority"]) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">
                          Total Amount <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="2500"
                          value={formData.totalAmount}
                          onChange={(e) => setFormData({ ...formData, totalAmount: Number.parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      
    </SidebarProvider>
  )
}
