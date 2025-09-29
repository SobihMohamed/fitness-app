"use client"

import { useEffect, useMemo, useId } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"

export default function CheckoutSuccess() {
  const reactId = useId()
  // Deterministic pseudo-random order number derived from React.useId()
  const orderNumber = useMemo(() => {
    let hash = 0
    for (let i = 0; i < reactId.length; i++) {
      hash = (hash * 31 + reactId.charCodeAt(i)) >>> 0
    }
    // Map to 6-digit range 100000 - 999999
    const mapped = 100000 + (hash % 900000)
    return mapped
  }, [reactId])

  useEffect(() => {
    // Clear any remaining cart data
    localStorage.removeItem("fitpro-cart")
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "#32CD32" }}>
              <CheckCircle className="h-12 w-12 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold" style={{ color: "#212529" }}>Order confirmed</h1>
            <p className="text-base sm:text-lg" style={{ color: "#6C757D" }}>
              Thank you for your purchase. We sent a confirmation email with your order details.
            </p>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" style={{ backgroundColor: "#007BFF" }}>
            <Link href={`/orders/${orderNumber}`} aria-label="Track your order">
              Track Order
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products" aria-label="Continue shopping">Continue Shopping</Link>
          </Button>
        </div>

        {/* Details */}
        <div className="mt-10">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: "#212529" }}>Order details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: "#6C757D" }}>Order number</p>
                  <p className="text-lg font-semibold" style={{ color: "#007BFF" }}>#{orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#6C757D" }}>Status</p>
                  <p className="text-lg font-semibold" style={{ color: "#212529" }}>Confirmed</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" style={{ color: "#32CD32" }} />
                  <p className="text-sm" style={{ color: "#212529" }}>A confirmation email has been sent.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" style={{ color: "#32CD32" }} />
                  <p className="text-sm" style={{ color: "#212529" }}>Estimated delivery: 3-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 text-center">
          <p className="text-sm" style={{ color: "#6C757D" }}>
            Need help? Contact our support team at {" "}
            <a href="mailto:support@fitpro.com" className="underline" style={{ color: "#007BFF" }}>
              support@fitpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
