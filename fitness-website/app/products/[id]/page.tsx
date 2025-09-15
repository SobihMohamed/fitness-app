"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Star, ArrowLeft, Truck, Shield, RotateCcw, Plus, Minus, Share2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { API_CONFIG } from "@/config/api"
import { getFullImageUrl, getProxyImageUrl } from "@/lib/images"
import { ProtectedAction } from "@/components/auth/Protected-Route"

interface Product {
  product_id: number
  name: string
  category_id: number
  price: number
  description: string
  image_url: string | null
  sub_images?: string[]
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  category_id: number
  name: string
}

export default function SingleProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, updateQuantity, state } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [activeImage, setActiveImage] = useState<string | null>(null)

  const { USER_PRODUCTS_API, USER_FUNCTIONS } = API_CONFIG

  // Helper to clamp quantity when stock is unknown or invalid
  const getMaxStock = useCallback((n: number) => (Number.isFinite(n) && n > 0 ? n : 999), [])

  // use shared getFullImageUrl from lib/images

  const fetchProduct = useCallback(async () => {
    if (!params.id) return

    setLoading(true)
    try {
      const response = await axios.get(USER_PRODUCTS_API.getById(params.id as string))
      const result = response.data

      let productData = null
      if (result && typeof result === "object") {
        productData = result.data || result.product || result.Product || result
      }

      if (productData) {
        // Robust stock quantity parsing with string boolean/number support
        // Priority:
        // 1) stock_quantity if provided
        // 2) is_in_stock (boolean or boolean-like string) -> true => large stock, false => 0
        // 3) quantity as a last resort (only numeric)
        const toBooleanLike = (v: any) => {
          if (typeof v === "boolean") return v
          if (typeof v === "string") {
            const s = v.trim().toLowerCase()
            if (["true", "1", "yes", "y"].includes(s)) return true
            if (["false", "0", "no", "n"].includes(s)) return false
          }
          return undefined
        }
        const toNumeric = (v: any) => {
          if (typeof v === "number") return Number.isFinite(v) ? Math.trunc(v) : NaN
          if (typeof v === "string") {
            const m = v.trim().match(/^\d+$/)
            if (m) return Number.parseInt(v, 10)
            return NaN
          }
          return NaN
        }
        let parsedStock = 0
        // 1) stock_quantity
        if (productData.stock_quantity !== undefined && productData.stock_quantity !== null) {
          const n = toNumeric(productData.stock_quantity)
          if (Number.isFinite(n)) parsedStock = n
        } else {
          // 2) is_in_stock
          const b = toBooleanLike(productData.is_in_stock)
          if (typeof b === "boolean") {
            // When only availability is known, do not fake a numeric stock.
            // Use NaN to represent unknown quantity but available when true.
            parsedStock = b ? Number.NaN : 0
          } else if (productData.quantity !== undefined && productData.quantity !== null) {
            // 3) quantity
            const q = toNumeric(productData.quantity)
            if (Number.isFinite(q)) parsedStock = q
          }
        }

        const normalizedProduct: Product = {
          product_id: Number.parseInt(productData.product_id || productData.id, 10),
          name: productData.name || "Unnamed Product",
          category_id: Number.parseInt(productData.category_id || productData.cat_id, 10) || 0,
          price: Number.parseFloat(productData.price) || 0,
          description: productData.description || "No description available",
          image_url: productData.image_url || productData.image || productData.main_image_url || null,
          sub_images: Array.isArray(productData.sub_images) ? productData.sub_images : [],
          stock_quantity: parsedStock,
          is_active: productData.is_active !== undefined ? productData.is_active : true,
          created_at: productData.created_at || "",
          updated_at: productData.updated_at || "",
        }

        setProduct(normalizedProduct)

        // Fetch category info and related products
        if (normalizedProduct.category_id) {
          fetchRelatedProducts(normalizedProduct.category_id)
        }
      } else {
        toast.error("Product not found")
        router.push("/products")
      }
    } catch (error: any) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product")
      router.push("/products")
    } finally {
      setLoading(false)
    }
  }, [params.id, USER_PRODUCTS_API, router])

  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url || null)
    }
  }, [product])

  const fetchRelatedProducts = useCallback(
    async (categoryId: number) => {
      try {
        const response = await axios.get(USER_FUNCTIONS.UserCategory.getproductsByCategoryId(categoryId.toString()))
        const result = response.data

        let rawData = []
        if (Array.isArray(result)) {
          rawData = result
        } else if (result && typeof result === "object") {
          rawData = result.data || result.products || []
        }

        const products = rawData
          .map((item: any) => ({
            product_id: Number.parseInt(item.product_id || item.id, 10),
            name: item.name || "Unnamed Product",
            category_id: Number.parseInt(item.category_id || item.cat_id, 10) || 0,
            price: Number.parseFloat(item.price) || 0,
            description: item.description || "No description available",
            image_url: item.image_url || item.image || item.main_image_url || null,
            stock_quantity: Number.parseInt(item.stock_quantity || item.is_in_stock || item.quantity, 10) || 0,
            is_active: item.is_active !== undefined ? item.is_active : true,
            created_at: item.created_at || "",
            updated_at: item.updated_at || "",
          }))
          .filter((p: Product) => p.product_id !== product?.product_id && p.is_active)
          .slice(0, 4)

        setRelatedProducts(products)
      } catch (error) {
        console.error("Error fetching related products:", error)
      }
    },
    [USER_FUNCTIONS, product?.product_id],
  )

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleAddToCart = () => {
    if (!product) return

    if (Number.isFinite(product.stock_quantity) && product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    if (Number.isFinite(product.stock_quantity)) {
      if (quantity > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} items available`)
        return
      }
    }

    const id = product.product_id.toString()
    const existingQty = state.items.find((i) => i.id === id)?.quantity ?? 0
    const targetQty = existingQty + quantity

    // Add item (adds quantity 1 if new, or increments by 1 if exists)
    addItem({
      id,
      name: product.name,
      price: product.price,
      image: getFullImageUrl(product.image_url),
      // only pass stock if it is a valid finite number
      ...(Number.isFinite(product.stock_quantity) ? { stock: product.stock_quantity } : {}),
    })

    // Explicitly set the desired total quantity (existing + selected)
    if (quantity > 1 || existingQty > 0) {
      updateQuantity(id, targetQty)
    }

    toast.success(`${quantity} ${product.name}${quantity > 1 ? "s" : ""} added to cart`)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Product link copied to clipboard")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/2">
                <div className="aspect-square bg-gray-200 rounded-xl shadow-sm" />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg shadow-sm" />
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
                <div className="h-24 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-10 bg-gray-100 rounded-lg w-full" />
                <div className="h-12 bg-gray-200 rounded-lg w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="mt-4 text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push("/products")} className="mt-6 bg-primary hover:bg-primary/90 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.back()} className="mb-6 text-muted-foreground hover:text-foreground border-gray-200 hover:border-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 border border-gray-100 shadow-sm">
              <Image
                src={getProxyImageUrl(activeImage || undefined, { width: 800, height: 800, quality: 80 }) || "/placeholder.svg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {Number.isFinite(product.stock_quantity) && product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="destructive" className="text-white font-semibold px-6 py-3 text-lg">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.sub_images && product.sub_images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {[product.image_url, ...product.sub_images].filter(Boolean).slice(0, 10).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img as string)}
                    className={`relative aspect-square rounded-md overflow-hidden border hover:shadow-md transition-all ${
                      activeImage === img ? "border-primary shadow-sm" : "border-transparent"
                    }`}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    <Image
                      src={getProxyImageUrl(img as string, { width: 200, height: 200, quality: 70 }) || "/placeholder.svg"}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleFavorite}
                    className="rounded-full w-12 h-12 bg-transparent border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="rounded-full w-12 h-12 bg-transparent border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">{product.price.toFixed(2)} EGP</span>
                <Badge
                  variant={
                    Number.isFinite(product.stock_quantity)
                      ? product.stock_quantity > 10
                        ? "secondary"
                        : product.stock_quantity > 0
                          ? "outline"
                          : "destructive"
                      : "secondary"
                  }
                  className="px-4 py-2"
                >
                  {Number.isFinite(product.stock_quantity)
                    ? product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : "Out of stock"
                    : "In stock"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted">(4.0) • 128 reviews</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed ">{product.description}</p>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg border-gray-200 shadow-sm">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="rounded-r-none hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <input
                    type="number"
                    min={1}
                    // no max here; enforce on add-to-cart
                    value={quantity}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value || "1", 10)
                      if (Number.isNaN(val)) {
                        setQuantity(1)
                        return
                      }
                      const clamped = Math.max(1, val)
                      setQuantity(clamped)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        setQuantity((q) => q + 1)
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                    }}
                    onBlur={() => {
                      setQuantity((q) => Math.max(1, q))
                    }}
                    className="px-4 py-2 min-w-[3rem] w-16 text-center outline-none border-0 focus:ring-0"
                    aria-label="Quantity"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setQuantity((q) => {
                        const next = q + 1
                        console.log("[Quantity +] q=", q, "next=", next)
                        return next
                      })
                    }}
                    className="rounded-l-none hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ProtectedAction onAction={handleAddToCart}>
                <Button
                  size="lg"
                  disabled={Number.isFinite(product.stock_quantity) && product.stock_quantity === 0}
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {Number.isFinite(product.stock_quantity)
                    ? product.stock_quantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"
                    : "Add to Cart"}
                </Button>
              </ProtectedAction>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted">On orders over 50 EGP</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Warranty</p>
                <p className="text-xs text-muted">1 year guarantee</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Returns</p>
                <p className="text-xs text-muted">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
