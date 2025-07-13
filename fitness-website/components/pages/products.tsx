"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ShoppingCart, Search, Filter } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

const products = [
  {
    id: 1,
    name: "Premium Whey Protein",
    category: "Supplements",
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300",
    description: "High-quality whey protein for muscle building and recovery",
    inStock: true,
  },
  {
    id: 2,
    name: "Adjustable Dumbbells Set",
    category: "Equipment",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    description: "Space-saving adjustable dumbbells for home workouts",
    inStock: true,
  },
  {
    id: 3,
    name: "Smart Fitness Tracker",
    category: "Technology",
    price: 199.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 256,
    image: "/placeholder.svg?height=300&width=300",
    description: "Advanced fitness tracking with heart rate monitoring",
    inStock: true,
  },
  {
    id: 4,
    name: "Resistance Bands Set",
    category: "Equipment",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.6,
    reviews: 178,
    image: "/placeholder.svg?height=300&width=300",
    description: "Complete resistance bands set for full-body workouts",
    inStock: true,
  },
  {
    id: 5,
    name: "Pre-Workout Energy",
    category: "Supplements",
    price: 34.99,
    originalPrice: null,
    rating: 4.5,
    reviews: 92,
    image: "/placeholder.svg?height=300&width=300",
    description: "Natural pre-workout supplement for enhanced performance",
    inStock: false,
  },
  {
    id: 6,
    name: "Yoga Mat Premium",
    category: "Equipment",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviews: 145,
    image: "/placeholder.svg?height=300&width=300",
    description: "Non-slip premium yoga mat for all types of workouts",
    inStock: true,
  },
  {
    id: 7,
    name: "Athletic Performance Tee",
    category: "Apparel",
    price: 24.99,
    originalPrice: null,
    rating: 4.4,
    reviews: 67,
    image: "/placeholder.svg?height=300&width=300",
    description: "Moisture-wicking athletic shirt for intense workouts",
    inStock: true,
  },
  {
    id: 8,
    name: "Creatine Monohydrate",
    category: "Supplements",
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.7,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300",
    description: "Pure creatine monohydrate for strength and power",
    inStock: true,
  },
]

const categories = ["All", "Supplements", "Equipment", "Technology", "Apparel"]

export function ProductsPage() {
  const { addItem, openCart } = useCart()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
    })
    openCart()
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }} className="mb-4">
            Shop Now
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: "#212529" }}>
            Premium Fitness
            <span style={{ color: "#007BFF" }}> Products</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "#6C757D" }}>
            Discover our carefully curated selection of fitness equipment, supplements, and apparel to support your
            fitness journey.
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: "#6C757D" }}
                />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20" style={{ backgroundColor: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-4 left-4">
                        <Badge style={{ backgroundColor: "#32CD32", color: "#FFFFFF" }}>
                          Save ${(product.originalPrice - product.price).toFixed(2)}
                        </Badge>
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge variant="outline" style={{ color: "#6C757D" }}>
                      {product.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2" style={{ color: "#212529" }}>
                    {product.name}
                  </CardTitle>
                  <CardDescription className="mb-4" style={{ color: "#6C757D" }}>
                    {product.description}
                  </CardDescription>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current" : ""}`}
                          style={{ color: "#32CD32" }}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm" style={{ color: "#6C757D" }}>
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold" style={{ color: "#007BFF" }}>
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm line-through" style={{ color: "#6C757D" }}>
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Button
                      disabled={!product.inStock}
                      style={{ backgroundColor: product.inStock ? "#007BFF" : "#6C757D" }}
                      className="hover:opacity-90"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl" style={{ color: "#6C757D" }}>
                No products found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
