"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SidebarProvider } from "@/components/ui/sidebar"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Package, AlertTriangle, TrendingUp, Edit, Trash2 } from "lucide-react"
import { useAppStore, type InventoryItem } from "@/lib/store"
import { useToast } from "@/components/toast-provider"
// Add useI18n hook and translate all inventory page content
import { useI18n } from "@/lib/i18n"

export default function InventoryPage() {
  const { state, dispatch } = useAppStore()
  const { addToast } = useToast()
  const { t } = useI18n()

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    material: "",
    weight: "",
    quantity: 0,
    minStock: 0,
    costPrice: 0,
    sellingPrice: 0,
  })

  const filteredInventory = useMemo(() => {
    return state.inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [state.inventory, searchTerm, categoryFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      material: "",
      weight: "",
      quantity: 0,
      minStock: 0,
      costPrice: 0,
      sellingPrice: 0,
    })
  }

  const handleAddItem = () => {
    if (!formData.name || !formData.sku || !formData.category || !formData.material || formData.quantity <= 0) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields and ensure quantity is positive.",
      })
      return
    }

    const newItem: InventoryItem = {
      id: Math.max(...state.inventory.map((i) => i.id), 0) + 1,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      material: formData.material,
      weight: formData.weight,
      quantity: formData.quantity,
      minStock: formData.minStock,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      status: formData.quantity <= formData.minStock ? "Low Stock" : "In Stock",
    }

    dispatch({ type: "ADD_INVENTORY_ITEM", payload: newItem })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        id: Date.now(),
        type: "inventory",
        title: "New product added",
        message: `${newItem.name} (${newItem.sku}) added to inventory`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "low",
      },
    })

    addToast({
      type: "success",
      title: "Product Added",
      description: `${formData.name} has been successfully added to inventory.`,
    })

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditItem = () => {
    if (
      !selectedItem ||
      !formData.name ||
      !formData.sku ||
      !formData.category ||
      !formData.material ||
      formData.quantity <= 0
    ) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields and ensure quantity is positive.",
      })
      return
    }

    const updatedItem: InventoryItem = {
      ...selectedItem,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      material: formData.material,
      weight: formData.weight,
      quantity: formData.quantity,
      minStock: formData.minStock,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      status: formData.quantity <= formData.minStock ? "Low Stock" : "In Stock",
    }

    dispatch({ type: "UPDATE_INVENTORY_ITEM", payload: updatedItem })

    addToast({
      type: "success",
      title: "Product Updated",
      description: `${formData.name} has been successfully updated.`,
    })

    setIsEditDialogOpen(false)
    setSelectedItem(null)
    resetForm()
  }

  const handleDeleteItem = () => {
    if (!selectedItem) return

    dispatch({ type: "DELETE_INVENTORY_ITEM", payload: selectedItem.id })

    addToast({
      type: "success",
      title: "Product Deleted",
      description: `${selectedItem.name} has been removed from inventory.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      material: item.material,
      weight: item.weight,
      quantity: item.quantity,
      minStock: item.minStock,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const totalValue = state.inventory.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
  const lowStockItemsCount = state.inventory.filter((item) => item.quantity <= item.minStock).length

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "destructive"
      case "Out of Stock":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Update page title and all content with translations */}
          <TopNav pageTitle={t("inventory.title")} />
          <main className="flex-1 overflow-auto px-4 py-4">
            {" "}
            {/* Changed p-4 to px-4 py-4 */}
            {/* Inventory Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  {/* Update all card titles, buttons, and form elements */}
                  <CardTitle className="text-sm font-medium">{t("inventory.totalItems")}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{state.inventory.length}</div>
                  <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("inventory.totalValue")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">At cost price</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("inventory.lowStockAlerts")}</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{lowStockItemsCount}</div>
                  <p className="text-xs text-muted-foreground">Items need restocking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("inventory.avgMargin")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67%</div>
                  <p className="text-xs text-muted-foreground">Profit margin</p>
                </CardContent>
              </Card>
            </div>
            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Add a new jewelry item to your inventory.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">
                          Product Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter product name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sku">
                          SKU <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="sku"
                          placeholder="Product SKU"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Rings">Rings</SelectItem>
                            <SelectItem value="Necklaces">Necklaces</SelectItem>
                            <SelectItem value="Bracelets">Bracelets</SelectItem>
                            <SelectItem value="Earrings">Earrings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="material">
                          Material <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="material"
                          placeholder="e.g., 18K Gold"
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          placeholder="5.2g"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">
                          Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="10"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="minStock">Min Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          placeholder="5"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="costPrice">Cost Price</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          placeholder="450"
                          value={formData.costPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sellingPrice">Selling Price</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          placeholder="750"
                          value={formData.sellingPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>Add Product</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Inventory Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your jewelry inventory and track stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Material & Weight</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const margin =
                        item.costPrice > 0
                          ? (((item.sellingPrice - item.costPrice) / item.costPrice) * 100).toFixed(1)
                          : "0.0"
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{item.material}</div>
                              <div className="text-sm text-muted-foreground">{item.weight}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{item.quantity}</span>
                              {item.quantity <= item.minStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            </div>
                            <div className="text-xs text-muted-foreground">Min: {item.minStock}</div>
                          </TableCell>
                          <TableCell>${item.costPrice}</TableCell>
                          <TableCell>${item.sellingPrice}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              +{margin}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(item)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update jewelry item details.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-sku">
                        SKU <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rings">Rings</SelectItem>
                          <SelectItem value="Necklaces">Necklaces</SelectItem>
                          <SelectItem value="Bracelets">Bracelets</SelectItem>
                          <SelectItem value="Earrings">Earrings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-material">
                        Material <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-material"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-weight">Weight</Label>
                      <Input
                        id="edit-weight"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-minStock">Min Stock</Label>
                      <Input
                        id="edit-minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-costPrice">Cost Price</Label>
                      <Input
                        id="edit-costPrice"
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                      <Input
                        id="edit-sellingPrice"
                        type="number"
                        value={formData.sellingPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, sellingPrice: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditItem}>Update Product</Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {selectedItem?.name} and remove it from
                    your inventory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteItem}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Product
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </main>
        </div>
    </SidebarProvider>
  )
}
