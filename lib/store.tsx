"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

// Types
export interface Customer {
  id: number
  name: string
  phone: string
  email: string
  birthday: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  status: "VIP" | "Premium" | "Regular"
  joinDate: string
  notes: string
}

export interface Order {
  id: number
  orderNumber: string
  customer: string
  customerId: number
  product: string
  craftsman: string
  status: "Order Received" | "In Progress" | "Completed" | "Delivered"
  priority: "Low" | "Medium" | "High" | "Urgent"
  orderDate: string
  dueDate: string
  totalAmount: number
  description: string
}

export interface InventoryItem {
  id: number
  name: string
  sku: string
  category: string
  material: string
  weight: string
  quantity: number
  minStock: number
  costPrice: number
  sellingPrice: number
  status: "In Stock" | "Low Stock" | "Out of Stock"
}

export interface Notification {
  id: number
  type: "order" | "inventory" | "customer" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
}

export interface ReturnItem {
  id: number
  returnNumber: string
  orderId: number
  orderNumber: string
  customerId: number
  customerName: string
  productName: string
  returnReason: string
  returnDate: string
  status: "Pending" | "Approved" | "Rejected" | "Refunded" | "Exchanged"
  refundAmount: number
  isReturnable: boolean
  returnCondition: "New" | "Good" | "Fair" | "Poor"
  notes: string
  processedBy?: string
  processedDate?: string
}

interface AppState {
  customers: Customer[]
  orders: Order[]
  inventory: InventoryItem[]
  returns: ReturnItem[]
  notifications: Notification[]
  isDarkMode: boolean
  searchQuery: string
}

type AppAction =
  | { type: "ADD_CUSTOMER"; payload: Customer }
  | { type: "UPDATE_CUSTOMER"; payload: Customer }
  | { type: "DELETE_CUSTOMER"; payload: number }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: Order }
  | { type: "DELETE_ORDER"; payload: number }
  | { type: "ADD_INVENTORY_ITEM"; payload: InventoryItem }
  | { type: "UPDATE_INVENTORY_ITEM"; payload: InventoryItem }
  | { type: "DELETE_INVENTORY_ITEM"; payload: number }
  | { type: "ADD_RETURN"; payload: ReturnItem }
  | { type: "UPDATE_RETURN"; payload: ReturnItem }
  | { type: "DELETE_RETURN"; payload: number }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: number }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_SEARCH_QUERY"; payload: string }

// Initial data
const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
    birthday: "1985-03-15",
    totalOrders: 12,
    totalSpent: 15420,
    lastOrder: "2024-06-15",
    status: "VIP",
    joinDate: "2023-01-15",
    notes: "Prefers white gold, allergic to nickel",
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+1 (555) 987-6543",
    email: "m.chen@email.com",
    birthday: "1990-07-22",
    totalOrders: 5,
    totalSpent: 3200,
    lastOrder: "2024-06-20",
    status: "Regular",
    joinDate: "2023-08-10",
    notes: "Corporate client, bulk orders",
  },
  {
    id: 3,
    name: "Emma Williams",
    phone: "+1 (555) 456-7890",
    email: "emma.w@email.com",
    birthday: "1988-12-03",
    totalOrders: 8,
    totalSpent: 8750,
    lastOrder: "2024-06-18",
    status: "Premium",
    joinDate: "2023-03-22",
    notes: "Frequent custom orders, excellent payment history",
  },
]

const initialOrders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customer: "Sarah Johnson",
    customerId: 1,
    product: "Custom Diamond Ring",
    craftsman: "John Smith",
    status: "In Progress",
    priority: "High",
    orderDate: "2024-06-15",
    dueDate: "2024-07-15",
    totalAmount: 2500,
    description: "18K white gold with 1ct diamond solitaire",
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customer: "Michael Chen",
    customerId: 2,
    product: "Gold Necklace Repair",
    craftsman: "Maria Garcia",
    status: "Completed",
    priority: "Medium",
    orderDate: "2024-06-10",
    dueDate: "2024-06-25",
    totalAmount: 150,
    description: "Repair broken clasp and polish",
  },
]

const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Gold Ring - Classic Band",
    sku: "GR-001",
    category: "Rings",
    material: "18K Gold",
    weight: "5.2g",
    quantity: 12,
    minStock: 5,
    costPrice: 450,
    sellingPrice: 750,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Diamond Necklace - Solitaire",
    sku: "DN-002",
    category: "Necklaces",
    material: "14K Gold + Diamond",
    weight: "8.5g",
    quantity: 3,
    minStock: 5,
    costPrice: 1200,
    sellingPrice: 2100,
    status: "Low Stock",
  },
]

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "order",
    title: "New order received",
    message: "Custom diamond ring from Sarah Johnson",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    priority: "high",
  },
  {
    id: 2,
    type: "inventory",
    title: "Low stock alert",
    message: "18K Gold running low (5 units remaining)",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    priority: "medium",
  },
]

const initialReturns: ReturnItem[] = [
  {
    id: 1,
    returnNumber: "RET-001",
    orderId: 1,
    orderNumber: "ORD-001",
    customerId: 1,
    customerName: "Sarah Johnson",
    productName: "Custom Diamond Ring",
    returnReason: "Size adjustment needed",
    returnDate: "2024-06-20",
    status: "Pending",
    refundAmount: 2500,
    isReturnable: true,
    returnCondition: "New",
    notes: "Customer wants to exchange for smaller size",
  },
  {
    id: 2,
    returnNumber: "RET-002",
    orderId: 2,
    orderNumber: "ORD-002",
    customerId: 2,
    customerName: "Michael Chen",
    productName: "Gold Necklace Repair",
    returnReason: "Not satisfied with repair quality",
    returnDate: "2024-06-18",
    status: "Approved",
    refundAmount: 150,
    isReturnable: true,
    returnCondition: "Good",
    notes: "Repair work needs to be redone",
    processedBy: "John Smith",
    processedDate: "2024-06-19",
  },
]

const initialState: AppState = {
  customers: initialCustomers,
  orders: initialOrders,
  inventory: initialInventory,
  returns: initialReturns,
  notifications: initialNotifications,
  isDarkMode: false,
  searchQuery: "",
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_CUSTOMER":
      return {
        ...state,
        customers: [...state.customers, action.payload],
      }
    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((customer) => (customer.id === action.payload.id ? action.payload : customer)),
      }
    case "DELETE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.filter((customer) => customer.id !== action.payload),
      }
    case "ADD_ORDER":
      return {
        ...state,
        orders: [...state.orders, action.payload],
      }
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) => (order.id === action.payload.id ? action.payload : order)),
      }
    case "DELETE_ORDER":
      return {
        ...state,
        orders: state.orders.filter((order) => order.id !== action.payload),
      }
    case "ADD_INVENTORY_ITEM":
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      }
    case "UPDATE_INVENTORY_ITEM":
      return {
        ...state,
        inventory: state.inventory.map((item) => (item.id === action.payload.id ? action.payload : item)),
      }
    case "DELETE_INVENTORY_ITEM":
      return {
        ...state,
        inventory: state.inventory.filter((item) => item.id !== action.payload),
      }
    case "ADD_RETURN":
      return {
        ...state,
        returns: [...state.returns, action.payload],
      }
    case "UPDATE_RETURN":
      return {
        ...state,
        returns: state.returns.map((returnItem) => (returnItem.id === action.payload.id ? action.payload : returnItem)),
      }
    case "DELETE_RETURN":
      return {
        ...state,
        returns: state.returns.filter((returnItem) => returnItem.id !== action.payload),
      }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload ? { ...notification, read: true } : notification,
        ),
      }
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      }
    case "TOGGLE_DARK_MODE":
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      }
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider")
  }
  return context
}
