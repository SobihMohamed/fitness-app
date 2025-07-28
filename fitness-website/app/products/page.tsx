"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, ShoppingCart, Search, Filter } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import Image from "next/image";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { toast } from "react-hot-toast";

interface Product {
  product_id: number;
  name: string;
  category_id: number;
  price: number;
  description: string;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductsPage() {
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { category_id: number; name: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/Products/getAll");
        const result = await res.json();
        const data = result.data || result.products || result || [];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/Category/getAll");
        const result = await res.json();
        const data = result.data || result.categories || result || [];
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) return;
    const searchProducts = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/Products/searchProduct",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: searchTerm }),
          }
        );
        const result = await res.json();
        const data = result.data || result.products || [];
        setProducts(data);
      } catch (error) {
        console.error("Error searching products:", error);
        toast.error("Search failed");
      }
    };

    searchProducts();
  }, [searchTerm]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.product_id,
      name: product.name,
      price: product.price,
      image: product.image_url
        ? `http://localhost:8000/uploads/${product.image_url}`
        : "/placeholder.svg",
      category:
        categories.find((cat) => cat.category_id === product.category_id)
          ?.name || "Unknown",
      inStock: product.stock_quantity > 0,
    });
    openCart();
    toast.success(`${product.name} added to cart`);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        categories.find((cat) => cat.category_id === product.category_id)
          ?.name === selectedCategory;
      return matchesCategory && product.is_active;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-white text-center">
        <Badge className="bg-secondary mb-4">Shop Now</Badge>
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          Premium <span className="text-primary">Products</span>
        </h1>
        <p className="text-xl text-muted">
          Explore fitness gear, supplements & apparel built for performance.
        </p>
      </section>

      {/* Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between px-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <p className="text-xl text-muted">
                No products found matching your criteria.
              </p>
            </div>
          )}

          {filteredProducts.map((product) => (
            <Card
              key={product.product_id}
              className="group hover:shadow-lg transition-all border-0 shadow-md"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={
                      product.image_url
                        ? `http://localhost:8000/uploads/${product.image_url}`
                        : "/placeholder.svg"
                    }
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                  />
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-2">
                  <Badge variant="outline">
                    {categories.find(
                      (cat) => cat.category_id === product.category_id
                    )?.name || "Unknown"}
                  </Badge>
                </div>
                <CardTitle className="text-lg mb-2 text-foreground">
                  {product.name}
                </CardTitle>
                <CardDescription className="mb-4 text-muted line-clamp-2">
                  {product.description}
                </CardDescription>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4
                            ? "fill-current text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted">4.5 (24)</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className="text-sm text-muted">
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>

                <ProtectedAction onAction={() => handleAddToCart(product)}>
                  <Button
                    disabled={product.stock_quantity === 0}
                    className={`w-full flex items-center justify-center gap-2 ${
                      product.stock_quantity === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock_quantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </Button>
                </ProtectedAction>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
