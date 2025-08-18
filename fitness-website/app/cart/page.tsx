"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/contexts/cart-context"
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Tag } from "lucide-react"
import { useState, useEffect } from "react"

export default function CartPage() {
  const {
    state,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();
  const items = state.items;
  const total = getCartTotal();
  const itemCount = getCartCount();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [invalidCode, setInvalidCode] = useState(false);

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax - discount;

  useEffect(() => {
    const savedCode = localStorage.getItem("promoCode");
    if (savedCode) setPromoCode(savedCode);
  }, []);

  const handlePromoCode = () => {
    const code = promoCode.toLowerCase();
    if (code === "fitpro10") {
      setDiscount(total * 0.1);
      setInvalidCode(false);
      localStorage.setItem("promoCode", promoCode);
    } else if (code === "welcome20") {
      setDiscount(total * 0.2);
      setInvalidCode(false);
      localStorage.setItem("promoCode", promoCode);
    } else {
      setDiscount(0);
      setInvalidCode(true);
      localStorage.removeItem("promoCode");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <ShoppingCart className="h-24 w-24 mx-auto text-gray-500" />
          <h1 className="text-3xl font-bold text-gray-800">
            Your cart is empty
          </h1>
          <p className="text-lg text-gray-500">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Shopping Cart ({itemCount} items)
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item: CartItem, index: number) => (
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
                            <h3 className="font-medium text-gray-800">
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
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
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
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <Tag className="h-5 w-5 text-green-500" />
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button
                    onClick={handlePromoCode}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-500">
                    Promo code applied! You saved ${discount.toFixed(2)}
                  </p>
                )}
                {invalidCode && (
                  <p className="text-sm text-red-500">
                    Invalid code. Try FITPRO10 or WELCOME20.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-500">
                    Add ${(50 - total).toFixed(2)} more for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              style={{ backgroundColor: "#007BFF" }}
              asChild
            >
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 text-gray-800">
                  Why shop with us?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Expert customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Secure checkout process</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

