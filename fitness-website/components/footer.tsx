import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-foreground text-white  bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">FitOrigin</h3>
            <p className="text-gray-300">
              Transform your body, mind, and life with our comprehensive fitness programs and expert guidance.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/share/1D2euR9yin/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FitOrigin on Facebook"
                className="text-gray-300 hover:text-primary"
              >
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://www.instagram.com/fitorigin_org?igsh=anI0MjBuemZmdmFw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FitOrigin on Instagram"
                className="text-gray-300 hover:text-primary"
              >
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/courses" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products/supplements" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Supplements
                </Link>
              </li>
              <li>
                <Link href="/products/equipment" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Equipment
                </Link>
              </li>
              <li>
                <Link href="/products/apparel" prefetch={false} className="text-gray-300 hover:text-primary transition-colors">
                  Apparel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300">info@fitorigin.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-300">123 Fitness St, Health City</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-300">Subscribe to our newsletter</p>
              <div className="flex space-x-2">
                <Input type="email" placeholder="Your email" className="bg-gray-800 border-gray-700 text-white" />
                <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 FitOrigin. All rights reserved. |
            <Link href="/privacy" prefetch={false} className="text-primary hover:underline ml-1">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/terms" prefetch={false} className="text-primary hover:underline ml-1">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
