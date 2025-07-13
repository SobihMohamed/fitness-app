"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"

export default function CheckoutSuccess() {
  const [orderNumber] = useState(() => Math.floor(Math.random() * 1000000))

  useEffect(() => {
    // Clear any remaining cart data
    localStorage.removeItem("fitpro-cart")
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#32CD32" }}
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold" style={{ color: "#212529" }}>
              Order Confirmed!
            </h1>
            <p className="text-xl" style={{ color: "#6C757D" }}>
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          <Card className="bg-white border-0 shadow-lg max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center" style={{ color: "#212529" }}>
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm" style={{ color: "#6C757D" }}>
                  Order Number
                </p>
                <p className="text-lg font-bold" style={{ color: "#007BFF" }}>
                  #{orderNumber}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" style={{ color: "#32CD32" }} />
                  <span className="text-sm" style={{ color: "#212529" }}>
                    Confirmation email sent
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5" style={{ color: "#32CD32" }} />
                  <span className="text-sm" style={{ color: "#212529" }}>
                    Estimated delivery: 3-5 business days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <p className="text-lg" style={{ color: "#212529" }}>
              What's next?
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-3" style={{ color: "#007BFF" }} />
                  <h3 className="font-medium mb-2" style={{ color: "#212529" }}>
                    Track Your Order
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#6C757D" }}>
                    We'll send you tracking information once your order ships.
                  </p>
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: "#32CD32" }} />
                  <h3 className="font-medium mb-2" style={{ color: "#212529" }}>
                    Stay Updated
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#6C757D" }}>
                    Get fitness tips and exclusive offers in your inbox.
                  </p>
                  <Button variant="outline" size="sm">
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" style={{ backgroundColor: "#007BFF" }}>
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Return Home</Link>
            </Button>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm" style={{ color: "#6C757D" }}>
              Need help? Contact our support team at{" "}
              <a href="mailto:support@fitpro.com" className="underline" style={{ color: "#007BFF" }}>
                support@fitpro.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
