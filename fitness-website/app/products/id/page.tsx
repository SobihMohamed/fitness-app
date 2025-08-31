"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Star, ArrowLeft, Truck, Shield, RotateCcw, Plus, Minus, Share2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
// import { ProtectedAction } from "@/components/auth/protected-route"
import { toast } from "sonner"
import { API_CONFIG } from "@/config/api"
import { ProtectedAction } from "@/components/auth/Protected-Route"

interface Product {
  product_id: number
  name: string
  category_id: number
  price: number
  description: string
  image_url: string | null
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
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  const { TARGET_URL: API_TARGET, USER_PRODUCTS_API, USER_FUNCTIONS } = API_CONFIG

  const getFullImageUrl = useCallback(
    (imagePath: string | null) => {
      if (!imagePath) return "/placeholder.svg?height=600&width=600&text=Product"
      if (imagePath.startsWith("http")) return imagePath
      return `${API_TARGET}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
    },
    [API_TARGET],
  )

  const fetchProduct = useCallback(async () => {
    if (!params.id) return

    setLoading(true)
    try {
      const response = await axios.get(USER_PRODUCTS_API.getById(params.id as string))
      const result = response.data
      console.log("Single Product Response:", result)

      let productData = null
      if (result && typeof result === "object") {
        productData = result.data || result.product || result
      }

      if (productData) {
        const normalizedProduct: Product = {
          product_id: Number.parseInt(productData.product_id || productData.id, 10),
          name: productData.name || "Unnamed Product",
          category_id: Number.parseInt(productData.category_id || productData.cat_id, 10) || 0,
          price: Number.parseFloat(productData.price) || 0,
          description: productData.description || "No description available",
          image_url: productData.image_url || productData.image || null,
          stock_quantity:
            Number.parseInt(productData.stock_quantity || productData.is_in_stock || productData.quantity, 10) || 0,
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
            image_url: item.image_url || item.image || null,
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

    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock")
      return
    }

    if (quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`)
      return
    }

    addItem({
      id: product.product_id.toString(),
      name: product.name,
      price: product.price,
      image: getFullImageUrl(product.image_url),
    //   quantity: quantity,
    })

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => router.push("/products")}>
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
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={getFullImageUrl(product.image_url) || "/placeholder.svg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="destructive" className="text-white font-semibold px-6 py-3 text-lg">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleFavorite}
                    className="rounded-full w-12 h-12 bg-transparent"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="rounded-full w-12 h-12 bg-transparent"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                <Badge
                  variant={
                    product.stock_quantity > 10 ? "secondary" : product.stock_quantity > 0 ? "outline" : "destructive"
                  }
                  className="px-4 py-2"
                >
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
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
              <p className="text-muted leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="rounded-l-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ProtectedAction onAction={handleAddToCart}>
                <Button
                  size="lg"
                  disabled={product.stock_quantity === 0}
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </ProtectedAction>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted">On orders over $50</p>
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-white rounded-lg">
            <div className="px-8">
              <h2 className="text-3xl font-bold mb-8 text-center">Related Products</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.product_id}
                    className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={getFullImageUrl(relatedProduct.image_url) || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">{relatedProduct.name}</h3>
                      <p className="text-sm text-muted mb-3 line-clamp-2">{relatedProduct.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${relatedProduct.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/products/${relatedProduct.product_id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
