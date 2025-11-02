"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { toast } from "sonner"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  category?: string
  quantity: number
  description?: string
  stock?: number
}

interface CartState {
  items: CartItem[]
  total: number
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartState }

const initialState: CartState = {
  items: [],
  total: 0,
  isOpen: false,
}

const norm = (v: string) => String(v)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex((item) => norm(item.id) === norm(action.payload.id))
      const item = action.payload

      let updatedItems
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        }
      } else {
        // Item doesn't exist, add new item with quantity 1
        updatedItems = [...state.items, { ...item, quantity: 1 }]
      }
      
      // Calculate new total
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return { ...state, items: updatedItems, total }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => norm(item.id) !== norm(action.payload))
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: updatedItems,
        total,
      }
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload

      const updatedItems = state.items
        .map((item) => norm(item.id) === norm(id) ? { ...item, quantity } : item)
        .filter((item) => item.quantity > 0)
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: updatedItems,
        total,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      }

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      }

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }

    case "LOAD_CART":
      return {
        ...state,
        ...action.payload,
        // Never auto-open cart on load
        isOpen: false,
      }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (parsedCart && parsedCart.items) {
          // Calculate total when loading from storage
          const total = parsedCart.items.reduce(
            (sum: number, item: CartItem) => sum + (item.price * item.quantity), 
            0
          )
          dispatch({ 
            type: "LOAD_CART", 
            // Only load items and total, force isOpen false to avoid auto-opening on reload
            payload: { items: parsedCart.items, total, isOpen: false } 
          })
        }
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error)
        localStorage.removeItem("cart") // Clear invalid cart data
      }
    }
  }, [])

  useEffect(() => {
    // Debounce cart persistence for better performance
    const timeoutId = setTimeout(() => {
      // Persist only cart items and total, not UI open state
      if (state.items.length > 0) {
        localStorage.setItem("cart", JSON.stringify({ items: state.items, total: state.total }))
      } else {
        // Clear storage when cart becomes empty
        localStorage.removeItem("cart")
      }
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [state.items, state.total])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    // Check stock and current quantity before dispatching
    const existing = state.items.find((it) => norm(it.id) === norm(item.id))
    const currentQty = existing ? existing.quantity : 0
    const nextQty = currentQty + 1

    if (typeof item.stock === "number" && nextQty > item.stock) {
      toast.error(`Sorry, only ${item.stock} items available in stock`, { id: `stock-${norm(item.id)}` })
      return
    }

    dispatch({ type: "ADD_ITEM", payload: item })
    toast.success(`${item.name} added to cart`, { id: `added-${norm(item.id)}` })
  }

  const removeItem = (id: string) => {
    const itemToRemove = state.items.find(item => item.id === id)
    if (itemToRemove) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
      toast.success(`${itemToRemove.name} removed from cart`)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast.success("Cart cleared")
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }
  
  const openCart = () => {
    dispatch({ type: "OPEN_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }
  
  const getCartTotal = () => {
    return state.total
  }
  
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
