"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SidebarProvider } from "@/components/ui/sidebar" // Removed SidebarInset import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, RotateCcw, CheckCircle, XCircle, Clock, DollarSign, Filter, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore, type ReturnItem } from "@/lib/store"
import { useToast } from "@/components/toast-provider"
// Add useI18n hook and translate all returns page content
import { useI18n } from "@/lib/i18n"

export default function ReturnsPage() {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()
  const { t } = useI18n()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null)
  const [selectedReturns, setSelectedReturns] = useState<number[]>([])
  const [formData, setFormData] = useState({
    orderId: 0,
    orderNumber: "",
    customerId: 0,
    customerName: "",
    productName: "",
    returnReason: "",
    returnDate: "",
    refundAmount: 0,
    returnCondition: "New" as ReturnItem["returnCondition"],
    notes: "",
  })

  const filteredReturns = useMemo(() => {
    return state.returns.filter((returnItem) => {
      const matchesSearch =
        returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [state.returns, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      orderId: 0,
      orderNumber: "",
      customerId: 0,
      customerName: "",
      productName: "",
      returnReason: "",
      returnDate: "",
      refundAmount: 0,
      returnCondition: "New",
      notes: "",
    })
  }

  const checkIfReturnable = (orderId: number): boolean => {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return false

    // Check if order is completed and delivered
    if (order.status !== "Completed" && order.status !== "Delivered") return false

    // Check if return is within 30 days (example policy)
    const orderDate = new Date(order.orderDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

    return daysDiff <= 30
  }

  const handleAddReturn = () => {
    if (!formData.orderNumber || !formData.returnReason || !formData.returnDate) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const order = state.orders.find((o) => o.orderNumber === formData.orderNumber)
    if (!order) {
      addToast({
        type: "error",
        title: "Order Not Found",
        description: "Please select a valid order number",
      })
      return
    }

    const customer = state.customers.find((c) => c.id === order.customerId)
    if (!customer) {
      addToast({
        type: "error",
        title: "Customer Not Found",
        description: "Customer information not found",
      })
      return
    }

    const isReturnable = checkIfReturnable(order.id)
    if (!isReturnable) {
      addToast({
        type: "error",
        title: "Item Not Returnable",
        description: "This item is not eligible for return (order must be completed and within 30 days)",
      })
      return
    }

    const newReturn: ReturnItem = {
      id: Math.max(...state.returns.map((r) => r.id), 0) + 1,
      returnNumber: `RET-${(Math.max(...state.returns.map((r) => r.id), 0) + 1).toString().padStart(3, "0")}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      productName: order.product,
      returnReason: formData.returnReason,
      returnDate: formData.returnDate,
      status: "Pending",
      refundAmount: formData.refundAmount || order.totalAmount,
      isReturnable: true,
      returnCondition: formData.returnCondition,
      notes: formData.notes,
    }

    dispatch({ type: "ADD_RETURN", payload: newReturn })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: Date.now(),
        type: "order",
        title: "New return request",
        message: `Return ${newReturn.returnNumber} from ${newReturn.customerName}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "medium",
      },
    })

    addToast({
      type: "success",
      title: "Return Created",
      description: `Return ${newReturn.returnNumber} has been successfully created`,
    })

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleUpdateReturnStatus = (returnItem: ReturnItem, newStatus: ReturnItem["status"]) => {
    const updatedReturn: ReturnItem = {
      ...returnItem,
      status: newStatus,
      processedBy: "Current User",
      processedDate: new Date().toISOString().split("T")[0],
    }

    dispatch({ type: "UPDATE_RETURN", payload: updatedReturn })

    addToast({
      type: "success",
      title: "Return Updated",
      description: `Return ${returnItem.returnNumber} status changed to ${newStatus}`,
    })
  }

  const handleDeleteReturn = () => {
    if (!selectedReturn) return

    dispatch({ type: "DELETE_RETURN", payload: selectedReturn.id })

    addToast({
      type: "success",
      title: "Return Deleted",
      description: `Return ${selectedReturn.returnNumber} has been removed`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedReturn(null)
  }

  const openDeleteDialog = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem)
    setIsDeleteDialogOpen(true)
  }

  const getStatusColor = (status: ReturnItem["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Exchanged":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: ReturnItem["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      case "Refunded":
        return <DollarSign className="h-4 w-4" />
      case "Exchanged":
        return <RotateCcw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Calculate metrics
  const totalReturns = state.returns.length
  const pendingReturns = state.returns.filter((r) => r.status === "Pending").length
  const approvedReturns = state.returns.filter((r) => r.status === "Approved").length
  const totalRefundAmount = state.returns
    .filter((r) => r.status === "Refunded")
    .reduce((sum, r) => sum + r.refundAmount, 0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav pageTitle="Returns Management" />
        <main className="flex-1 overflow-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              {/* Update page header */}
              <h1 className="text-3xl font-bold tracking-tight">{t("returns.title")}</h1>
              <p className="text-muted-foreground">{t("returns.subtitle")}</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                {/* Update all buttons, labels, and content */}
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("returns.newReturn")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Return</DialogTitle>
                  <DialogDescription>Process a new product return request.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="orderNumber">
                        Order Number <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.orderNumber}
                        onValueChange={(value) => {
                          const order = state.orders.find((o) => o.orderNumber === value)
                          if (order) {
                            const customer = state.customers.find((c) => c.id === order.customerId)
                            setFormData({
                              ...formData,
                              orderNumber: value,
                              orderId: order.id,
                              customerId: order.customerId,
                              customerName: customer?.name || "",
                              productName: order.product,
                              refundAmount: order.totalAmount,
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select order" />
                        </SelectTrigger>
                        <SelectContent>
                          {state.orders
                            .filter((order) => order.status === "Completed" || order.status === "Delivered")
                            .map((order) => (
                              <SelectItem key={order.id} value={order.orderNumber}>
                                {order.orderNumber} - {order.product}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer</Label>
                      <Input id="customerName" value={formData.customerName} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="productName">Product</Label>
                    <Input id="productName" value={formData.productName} disabled className="bg-muted" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="returnReason">
                      Return Reason <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.returnReason}
                      onValueChange={(value) => setFormData({ ...formData, returnReason: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Defective product">Defective product</SelectItem>
                        <SelectItem value="Wrong size">Wrong size</SelectItem>
                        <SelectItem value="Not as described">Not as described</SelectItem>
                        <SelectItem value="Customer changed mind">Customer changed mind</SelectItem>
                        <SelectItem value="Damaged during shipping">Damaged during shipping</SelectItem>
                        <SelectItem value="Quality issues">Quality issues</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="returnDate">
                        Return Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="refundAmount">Refund Amount</Label>
                      <Input
                        id="refundAmount"
                        type="number"
                        value={formData.refundAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, refundAmount: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="returnCondition">Item Condition</Label>
                      <Select
                        value={formData.returnCondition}
                        onValueChange={(value: ReturnItem["returnCondition"]) =>
                          setFormData({ ...formData, returnCondition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about the return..."
                      className="min-h-[80px]"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddReturn}>Create Return</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                {/* Update card titles */}
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {t("returns.totalReturns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReturns}</div>
                <p className="text-xs text-muted-foreground">All time returns</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pending Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingReturns}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedReturns}</div>
                <p className="text-xs text-muted-foreground">Ready for processing</p>
              </CardContent>
            </Card>
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  Total Refunds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${totalRefundAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Refunded amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mt-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Exchanged">Exchanged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Returns Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Returns Database</CardTitle>
              <CardDescription>
                {filteredReturns.length} of {state.returns.length} returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return #</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{returnItem.returnNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{returnItem.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{returnItem.customerName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{returnItem.productName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">{returnItem.returnReason}</div>
                      </TableCell>
                      <TableCell>{new Date(returnItem.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">${returnItem.refundAmount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(returnItem.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(returnItem.status)}
                            {returnItem.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {returnItem.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-300 bg-transparent"
                                onClick={() => handleUpdateReturnStatus(returnItem, "Approved")}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 bg-transparent"
                                onClick={() => handleUpdateReturnStatus(returnItem, "Rejected")}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {returnItem.status === "Approved" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-300 bg-transparent"
                                onClick={() => handleUpdateReturnStatus(returnItem, "Refunded")}
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Refund
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 border-purple-300 bg-transparent"
                                onClick={() => handleUpdateReturnStatus(returnItem, "Exchanged")}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Exchange
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDeleteDialog(returnItem)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete return {selectedReturn?.returnNumber}
                  and remove it from your database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteReturn}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Return
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </SidebarProvider>
  )
}
