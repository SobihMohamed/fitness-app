"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Tag } from "lucide-react"
import { useState } from "react"

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const shipping = total > 50 ? 0 : 9.99
  const tax = total * 0.08
  const finalTotal = total + shipping + tax - discount

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === "fitpro10") {
      setDiscount(total * 0.1)
    } else if (promoCode.toLowerCase() === "welcome20") {
      setDiscount(total * 0.2)
    } else {
      setDiscount(0)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <ShoppingCart className="h-24 w-24 mx-auto" style={{ color: "#6C757D" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
              Your cart is empty
            </h1>
            <p className="text-lg" style={{ color: "#6C757D" }}>
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild size="lg" style={{ backgroundColor: "#007BFF" }}>
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
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: "#212529" }}>
            Shopping Cart ({itemCount} items)
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: "#212529" }}>Cart Items</CardTitle>
                <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-700">
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium" style={{ color: "#212529" }}>
                              {item.name}
                            </h3>
                            <Badge variant="outline" className="mt-1">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: "#007BFF" }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm" style={{ color: "#6C757D" }}>
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Tag className="h-5 w-5" style={{ color: "#32CD32" }} />
                  <div className="flex-1">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <Button onClick={handlePromoCode} style={{ backgroundColor: "#32CD32" }}>
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="text-sm mt-2" style={{ color: "#32CD32" }}>
                    Promo code applied! You saved ${discount.toFixed(2)}
                  </p>
                )}
                <div className="mt-4 text-sm" style={{ color: "#6C757D" }}>
                  <p>Try these codes:</p>
                  <p>• FITPRO10 - 10% off</p>
                  <p>• WELCOME20 - 20% off</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: "#212529" }}>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span style={{ color: "#6C757D" }}>Subtotal ({itemCount} items)</span>
                  <span style={{ color: "#212529" }}>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#6C757D" }}>Shipping</span>
                  <span style={{ color: "#212529" }}>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#6C757D" }}>Tax</span>
                  <span style={{ color: "#212529" }}>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "#32CD32" }}>Discount</span>
                    <span style={{ color: "#32CD32" }}>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span style={{ color: "#212529" }}>Total</span>
                  <span style={{ color: "#007BFF" }}>${finalTotal.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm" style={{ color: "#6C757D" }}>
                    Add ${(50 - total).toFixed(2)} more for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>

            <Button asChild className="w-full" size="lg" style={{ backgroundColor: "#007BFF" }}>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4" style={{ color: "#212529" }}>
                  Why shop with us?
                </h3>
                <div className="space-y-3 text-sm" style={{ color: "#6C757D" }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#32CD32" }} />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#32CD32" }} />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#32CD32" }} />
                    <span>Expert customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#32CD32" }} />
                    <span>Secure checkout process</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
