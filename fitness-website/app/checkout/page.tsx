"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getProxyImageUrl } from "@/lib/images"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/contexts/cart-context"
import { ArrowLeft, Truck, Shield, CheckCircle, Loader2 } from "lucide-react"
import axios from "axios"
import { API_CONFIG } from "@/config/api"
import { useAuth } from "@/contexts/auth-context"

// Removed detailed form fields; this page now focuses on summary + submit.

export default function CheckoutPage() {
  const { state, clearCart, getCartTotal, getCartCount } = useCart()
  const items = state.items
  const total = getCartTotal()
  const itemCount = getCartCount()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState("")

  // Memoized calculations for better performance
  const orderCalculations = useMemo(() => {
    const shipping = total > 50 ? 0 : 9.99
    const tax = total * 0.08
    const discountPercent = promoCode.trim().toUpperCase() === "DISCOUNT10" ? 10 : 0
    const preDiscountTotal = total + shipping + tax
    const finalTotal = preDiscountTotal * (1 - discountPercent / 100)
    
    return {
      shipping,
      tax,
      discountPercent,
      preDiscountTotal,
      finalTotal
    }
  }, [total, promoCode])

  const orderStats = useMemo(() => ({
    itemCount,
    totalItems: items.length,
    hasItems: items.length > 0,
    isValidOrder: items.length > 0 && user
  }), [items, itemCount, user])

  // Memoized handlers for better performance
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please login to complete your order.")
      router.push("/auth/login")
      return
    }

    if (items.length === 0) return

    setIsProcessing(true)
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null
      const ORDERS_API = API_CONFIG.USER_FUNCTIONS.orders

      // Prepare one order per cart item to match the backend table shape
      const purchaseDate = new Date()
      const formattedDate = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, "0")}-${String(
        purchaseDate.getDate()
      ).padStart(2, "0")} 00:00:00`

      const requests = items.map((item: CartItem) => {
        const original_total = item.price * item.quantity
        const itemNet = original_total * (1 - orderCalculations.discountPercent / 100)
        const payload = {
          user_id: user.id,
          product_id: item.id,
          purchase_date: formattedDate,
          quantity: item.quantity,
          original_total: Number(original_total.toFixed(2)),
          discount_value: orderCalculations.discountPercent,
          net_total: Number(itemNet.toFixed(2)),
          promo_code_used: promoCode || "",
          status: "pending",
        }

        return axios.post(ORDERS_API.create, payload, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
      })

      await Promise.all(requests)

      // Clear cart and redirect to success page
      clearCart()
      router.push("/checkout/success")
    } catch (error: any) {
      console.error("Order creation failed:", error)
      alert(error?.response?.data?.message || "Failed to complete the order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [user, items, orderCalculations, promoCode, router, clearCart])

  const handlePromoChange = useCallback((value: string) => {
    setPromoCode(value)
  }, [])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Your cart is empty
            </h1>
            <p className="text-lg text-gray-600">
              Add some items to your cart before checking out.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
            Checkout
          </h1>
        </div>

        {/* Stepper */}
        <div aria-label="Checkout progress" className="mb-8">
          <ol className="grid grid-cols-4 gap-4" role="list">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#007BFF" }}>1</span>
              <span className="text-sm font-medium" style={{ color: "#212529" }}>Cart</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#007BFF" }}>2</span>
              <span className="text-sm font-medium" style={{ color: "#212529" }}>Details</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#007BFF" }}>3</span>
              <span className="text-sm font-medium" style={{ color: "#212529" }}>Payment</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-semibold" style={{ backgroundColor: "#6C757D" }}>4</span>
              <span className="text-sm" style={{ color: "#6C757D" }}>Review</span>
            </li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Details + Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact/Billing Details */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle style={{ color: "#212529" }}>Billing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" placeholder="John Doe" autoComplete="name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" autoComplete="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" placeholder="123 Main St" autoComplete="street-address" />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle style={{ color: "#212529" }}>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <fieldset>
                    <legend className="sr-only">Payment Method</legend>
                    <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                      <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer" style={{ borderColor: "#E9ECEF" }}>
                        <input type="radio" name="paymentMethod" defaultChecked className="h-4 w-4" aria-label="Credit or Debit Card" />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: "#212529" }}>Credit / Debit Card</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>Visa, Mastercard</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer" style={{ borderColor: "#E9ECEF" }}>
                        <input type="radio" name="paymentMethod" className="h-4 w-4" aria-label="Cash on Delivery" />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: "#212529" }}>Cash on Delivery</p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>Pay when your order arrives</p>
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "#6C757D" }}>You will be charged</p>
                      <p className="text-xl font-bold" style={{ color: "#007BFF" }}>{orderCalculations.finalTotal.toFixed(2)} EGP</p>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isProcessing}
                      style={{ backgroundColor: "#007BFF" }}
                      className="min-w-48"
                    >
                      {isProcessing ? "Processing..." : "Complete Order"}
                    </Button>
                  </div>
                  <p className="text-xs" style={{ color: "#6C757D" }}>
                    By completing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Summary */}
            <div className="lg:sticky lg:top-6 space-y-6 h-max">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle style={{ color: "#212529" }}>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={getProxyImageUrl(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: "#212529" }}>
                            {item.name}
                          </p>
                          <p className="text-xs" style={{ color: "#6C757D" }}>
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-sm" style={{ color: "#007BFF" }}>
                          {(item.price * item.quantity).toFixed(2)} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <Label htmlFor="promo">Promo Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => handlePromoChange(e.target.value)}
                        aria-label="Promo code"
                      />
                      <Button type="button" variant="outline" disabled={!promoCode}>
                        Apply
                      </Button>
                    </div>
                    {orderCalculations.discountPercent > 0 && (
                      <p className="text-xs" style={{ color: "#32CD32" }}>Discount applied: {orderCalculations.discountPercent}%</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: "#6C757D" }}>Subtotal ({itemCount} items)</span>
                      <span style={{ color: "#212529" }}>{total.toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#6C757D" }}>Shipping</span>
                      <span style={{ color: "#212529" }}>{orderCalculations.shipping === 0 ? "FREE" : `${orderCalculations.shipping.toFixed(2)} EGP`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#6C757D" }}>Tax</span>
                      <span style={{ color: "#212529" }}>{orderCalculations.tax.toFixed(2)} EGP</span>
                    </div>
                    {orderCalculations.discountPercent > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: "#6C757D" }}>Discount ({orderCalculations.discountPercent}%)</span>
                        <span style={{ color: "#212529" }}>- {(orderCalculations.preDiscountTotal - orderCalculations.finalTotal).toFixed(2)} EGP</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: "#212529" }}>Total</span>
                      <span style={{ color: "#007BFF" }}>{orderCalculations.finalTotal.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
