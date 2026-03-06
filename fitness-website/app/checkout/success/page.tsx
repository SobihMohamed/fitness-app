"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"

// Generate a pseudo-random order number for display purposes
const generateOrderNumber = () => {
  return Math.floor(100000 + Math.random() * 900000)
}

export default function CheckoutSuccess() {
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  useEffect(() => {
    // Set order number only on client to avoid hydration mismatch
    setOrderNumber(generateOrderNumber())

    // Clear any remaining cart data
    localStorage.removeItem("fitpro-cart")
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-green-500 shadow-sm">
              <CheckCircle className="h-12 w-12 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Order confirmed</h1>
            <p className="text-base sm:text-lg text-slate-500">
              Thank you for your purchase. We sent a confirmation email with your order details.
            </p>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Link href={`/orders/${orderNumber || ''}`} aria-label="Track your order">
              Track Order
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-white">
            <Link href="/products" aria-label="Continue shopping">Continue Shopping</Link>
          </Button>
        </div>

        {/* Details */}
        <div className="mt-10">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900">Order details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Order number</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {orderNumber ? `#${orderNumber}` : "Loading..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <div className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-700">
                    Confirmed
                  </div>
                </div>

                <div className="col-span-full border-t border-slate-100 pt-4 mt-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Confirmation Sent</p>
                        <p className="text-sm text-slate-500">Check your inbox for details.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Processing</p>
                        <p className="text-sm text-slate-500">Estimated delivery: 3-5 business days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 text-center border-t border-slate-200 mt-10">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at {" "}
            <a href="mailto:support@fitpro.com" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
              support@fitpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
