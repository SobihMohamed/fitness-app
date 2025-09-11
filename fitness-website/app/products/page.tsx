"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Filter, Heart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { API_CONFIG } from "@/config/api"
import { ProtectedAction } from "@/components/auth/Protected-Route"
import { useAuth } from "@/contexts/auth-context"
import { getFullImageUrl, getProxyImageUrl } from "@/lib/images"

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

export default function ProductsPage() {
  const { addItem } = useCart()
  const { user, isInitialized } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const { USER_PRODUCTS_API, USER_FUNCTIONS } = API_CONFIG

  const normalizeProductData = useCallback(
    (item: any): Product => ({
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
    }),
    [],
  )

  const fetchProducts = useCallback(
    async ({
      categoryId,
      searchKeyword,
    }: {
      categoryId?: number
      searchKeyword?: string
    } = {}) => {
      setLoading(true)
      try {
        let response

        if (searchKeyword && searchKeyword.trim()) {
          response = await axios.post(USER_PRODUCTS_API.search, {
            keyword: searchKeyword,
          })
        } else if (categoryId) {
          response = await axios.get(USER_FUNCTIONS.UserCategory.getproductsByCategoryId(categoryId.toString()))
        } else {
          response = await axios.get(USER_PRODUCTS_API.getAll)
        }

        const result = response.data

        let rawData = []
        if (Array.isArray(result)) {
          rawData = result
        } else if (result && typeof result === "object") {
          rawData = result.data || result.products || []
        }

        const data = rawData.map(normalizeProductData)
        setProducts(data)
      } catch (error: any) {
        console.error("Error fetching products:", error)
        const errorMessage =
          error.response?.data?.message ||
          (searchKeyword
            ? "Search failed"
            : categoryId
              ? "Failed to load products by category"
              : "Failed to load products")
        toast.error(errorMessage)
        setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [USER_PRODUCTS_API, USER_FUNCTIONS, normalizeProductData],
  )

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(USER_FUNCTIONS.UserCategory.getAllCategory)
      const result = response.data

      const rawData = result.data || result.categories || result || []
      const data = rawData.map((item: any) => ({
        category_id: Number.parseInt(item.category_id || item.id, 10),
        name: item.name || "Unknown Category",
      }))
      setCategories(data)
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    }
  }, [USER_FUNCTIONS])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (selectedCategory === "All" && !searchTerm.trim()) {
      fetchProducts()
    } else if (searchTerm.trim()) {
      fetchProducts({ searchKeyword: searchTerm })
    } else {
      const category = categories.find((cat) => cat.name === selectedCategory)
      if (category) {
        fetchProducts({ categoryId: category.category_id })
      }
    }
  }, [selectedCategory, categories, searchTerm, fetchProducts])

  // Reset pagination when filters/search change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, searchTerm, sortBy, showFavoritesOnly])

  // Persisted favorites per authenticated user
  useEffect(() => {
    if (!isInitialized) return
    if (user?.id) {
      try {
        const raw = localStorage.getItem(`favorites:${user.id}`)
        if (raw) {
          const arr: number[] = JSON.parse(raw)
          setFavorites(new Set(arr))
        }
      } catch (e) {
        console.error("Failed to load favorites from storage", e)
      }
    } else {
      setFavorites(new Set())
    }
  }, [user?.id, isInitialized])

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (product.stock_quantity <= 0) {
        toast.error("This product is out of stock")
        return
      }

      const imagePath = getFullImageUrl(product.image_url)

      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock_quantity,
        image: imagePath,
        category: categories.find((cat) => cat.category_id === product.category_id)?.name || "Unknown",
      })

      toast.success(`${product.name} added to cart`)
    },
    [addItem],
  )

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
        toast.success("Removed from favorites")
      } else {
        newFavorites.add(productId)
        toast.success("Added to favorites")
      }
      // Persist only for authenticated users
      try {
        if (user?.id) {
          localStorage.setItem(`favorites:${user.id}`, JSON.stringify(Array.from(newFavorites)))
        }
      } catch (e) {
        console.error("Failed to persist favorites", e)
      }
      return newFavorites
    })
  }, [user?.id])

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => product.is_active)
      .filter((product) => (showFavoritesOnly ? favorites.has(product.product_id) : true))
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.price
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [products, sortBy, showFavoritesOnly, favorites])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  }, [filteredProducts.length, pageSize])

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, page, pageSize])

  const SkeletonCard = useMemo(
    () => (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">
        <CardHeader className="p-0">
          <div className="relative aspect-square bg-gray-200 animate-pulse" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    ),
    [],
  )

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4 px-4 py-1 text-sm font-medium">
            Our Collection
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            Premium Fitness{" "}
            <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Products
            </span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted leading-relaxed">
            Discover our curated collection of high-quality fitness equipment
            and supplements designed to help you achieve your goals and maintain
            a healthy lifestyle.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-y sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-56 h-12 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.name}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-56 h-12 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant={showFavoritesOnly ? "default" : "outline"}
                className={`h-12 ${
                  showFavoritesOnly
                    ? "bg-primary text-white"
                    : "bg-white border-gray-200 hover:border-gray-300 transition-colors"
                }`}
                onClick={() => setShowFavoritesOnly((v) => !v)}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    showFavoritesOnly ? "fill-current" : ""
                  }`}
                />
                Favorites Only
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              Array(12)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`}>{SkeletonCard}</div>
                ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    No products found
                  </h3>
                  <p className="text-muted mb-6">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl border-0"
                >
                  <CardHeader className="p-0 relative">
                    <Link href={`/products/${product.product_id}`}>
                      <div className="relative aspect-square overflow-hidden cursor-pointer">
                        <Image
                          src={
                            getProxyImageUrl(product.image_url, { width: 600, height: 600, quality: 75 }) ||
                            "/placeholder.svg"
                          }
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </Link>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.product_id);
                      }}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          favorites.has(product.product_id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      />
                    </Button>

                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <Badge
                          variant="destructive"
                          className="text-white font-semibold px-4 py-2 text-sm uppercase tracking-wider"
                        >
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Link href={`/products/${product.product_id}`}>
                        <CardTitle className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                          {product.name}
                        </CardTitle>
                      </Link>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {product.price.toFixed(2)} EGP
                        </span>
                        <Badge
                          variant={
                            product.stock_quantity > 10
                              ? "secondary"
                              : product.stock_quantity > 0
                              ? "outline"
                              : "destructive"
                          }
                          className={`px-3 py-1 ${
                            product.stock_quantity > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock_quantity > 0
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : ""
                          }`}
                        >
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} left`
                            : "Out of stock"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/products/${product.product_id}`}
                        className="col-span-2"
                      >
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 font-medium"
                          size="lg"
                        >
                          View Details
                        </Button>
                      </Link>

                      <ProtectedAction
                        onAction={() => handleAddToCart(product)}
                        
                      >
                        <Button
                          disabled={product.stock_quantity === 0}
                          className="w-full bg-primary/90 hover:bg-primary transition-all duration-300 font-medium"
                          size="lg"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {product.stock_quantity > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </Button>
                      </ProtectedAction>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Pagination Controls */}
          {!loading && filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-sm text-muted-foreground font-medium">
                Page {page} of {totalPages} • {filteredProducts.length} items
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  Prev
                </Button>
                <div className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md">
                  {page}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  Next
                </Button>
                <div className="ml-4">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                  >
                    <SelectTrigger className="w-28 h-9 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 / page</SelectItem>
                      <SelectItem value="12">12 / page</SelectItem>
                      <SelectItem value="16">16 / page</SelectItem>
                      <SelectItem value="24">24 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
