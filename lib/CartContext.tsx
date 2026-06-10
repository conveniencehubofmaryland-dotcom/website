'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  sku: string
  title: string
  price: number
  qty: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: number
  tax: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id)
      if (existing) {
        return prev.map(i => i.id === newItem.id ? { ...i, qty: i.qty + newItem.qty } : i)
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id)
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
    }
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const tax = subtotal * 0.06 // 6% Maryland sales tax
  const total = subtotal + tax

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, tax }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
