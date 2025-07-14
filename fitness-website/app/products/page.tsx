"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart, Search, Filter } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: 1,
    name: "Premium Whey Protein",
    category: "Supplements",
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.8,
    reviews: 124,
    description: "High-quality whey protein for muscle building and recovery",
    inStock: true,
    image: "/images/whey-protein.jpg",
  },
  {
    id: 2,
    name: "Adjustable Dumbbells Set",
    category: "Equipment",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviews: 89,
    description: "Space-saving adjustable dumbbells for home workouts",
    inStock: true,
    image: "/images/adjustable-dumbbells.jpg",
  },
  {
    id: 3,
    name: "Smart Fitness Tracker",
    category: "Technology",
    price: 199.99,
    originalPrice: null,
    rating: 4.7,
    reviews: 256,
    description: "Advanced fitness tracking with heart rate monitoring",
    inStock: true,
    image: "/images/smart-watch.jpg",
  },
  {
    id: 4,
    name: "Resistance Bands Set",
    category: "Equipment",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.6,
    reviews: 178,
    description: "Complete resistance bands set for full-body workouts",
    inStock: true,
    image: "/images/resistance-bands-gym.jpg",
  },
  {
    id: 5,
    name: "Pre-Workout Energy",
    category: "Supplements",
    price: 34.99,
    originalPrice: null,
    rating: 4.5,
    reviews: 92,
    description: "Natural pre-workout supplement for enhanced performance",
    inStock: false,
    image: "/images/pre-workout-powder.jpg",
  },
  {
    id: 6,
    name: "Yoga Mat Premium",
    category: "Equipment",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviews: 145,
    description: "Non-slip premium yoga mat for all types of workouts",
    inStock: true,
    image: "/images/premium-yoga-mat.jpg",
  },
]

const categories = ["All", "Supplements", "Equipment", "Technology", "Apparel"]

export default function ProductsPage() {
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  }) .sort((a, b) => {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-secondary text-secondary-foreground mb-4">Shop Now</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Premium Fitness
            <span className="text-primary"> Products</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted">
            Discover our carefully curated selection of fitness equipment, supplements, and apparel to support your
            fitness journey.
          </p>
        </div>
      </section>

      {/* Filters and Search replace with new one */}
      
      {/* <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                
                
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
            </div>
          </div>
        </div>
      </section> */}
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
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-secondary text-secondary-foreground">
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
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <CardTitle className="text-lg mb-2 text-foreground">{product.name}</CardTitle>
                  <CardDescription className="mb-4 text-muted">{product.description}</CardDescription>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm line-through text-muted">${product.originalPrice}</span>
                      )}
                    </div>
                    <Button
                      disabled={!product.inStock}
                      className={`w-full ${product.inStock ? "bg-primary hover:bg-primary/90" : ""}`}
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
              <p className="text-xl text-muted">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
