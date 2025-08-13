"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
import { ShoppingCart, Search, Filter } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedAction } from "@/components/auth/Protected-Route";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";

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

  const {
    TARGET_URL: API_TARGET,
    USER_PRODUCTS_API,
    USER_FUNCTIONS,
  } = API_CONFIG;
// Helper function to construct full image URL
  const getFullImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_TARGET}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  // Unified product normalization function
  const normalizeProductData = (item: any) => ({
    product_id: parseInt(item.product_id || item.id, 10),
    name: item.name,
    category_id: parseInt(item.category_id || item.cat_id, 10),
    price: parseFloat(item.price),
    description: item.description,
    image_url: item.image_url || item.image || null,
    stock_quantity:
      parseInt(
        item.stock_quantity || item.is_in_stock || item.quantity,
        10
      ) || 0,
    is_active: item.is_active !== undefined ? item.is_active : true,
    created_at: item.created_at || "",
    updated_at: item.updated_at || "",
  });

  // Unified data fetching function with axios for better error handling
  const fetchProducts = async ({
    categoryId,
    searchKeyword,
  }: {
    categoryId?: number;
    searchKeyword?: string;
  } = {}) => {
    setLoading(true);
    try {
      let response;

      // Determine which API endpoint to call based on parameters
      if (searchKeyword && searchKeyword.trim()) {
        // Search products
        response = await axios.post(USER_PRODUCTS_API.search, { keyword: searchKeyword });
      } else if (categoryId) {
        // Fetch products by category
        response = await axios.get(USER_FUNCTIONS.UserCategory.getproductsByCategoryId(categoryId.toString()));
      } else {
        // Fetch all products
        response = await axios.get(USER_PRODUCTS_API.getAll);
      }

      const result = response.data;

      // Normalize data regardless of API response structure
      let rawData = [];
      if (Array.isArray(result)) {
        rawData = result;
      } else if (result && typeof result === "object") {
        rawData = result.data || result.products || [];
      } else {
        rawData = [];
      }

      const data = rawData.map(normalizeProductData);
      setProducts(data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || 
          (searchKeyword
            ? "Search failed"
            : categoryId
            ? "Failed to load products by category"
            : "Failed to load products"));
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Network error. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Failed to load products");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on component mount with axios
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(USER_FUNCTIONS.UserCategory.getAllCategory);
        const result = response.data;
        const rawData = result.data || result.categories || result || [];
        const data = rawData.map((item: any) => ({
          category_id: parseInt(item.category_id || item.id, 10),
          name: item.name,
        }));
        setCategories(data);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          toast.error(`Failed to load categories: ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("Network error. Please check your connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error("Failed to load categories");
        }
      }
    };

    fetchCategories();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    if (selectedCategory === "All" && !searchTerm.trim()) {
      // Fetch all products when no filters are applied
      fetchProducts();
    } else if (searchTerm.trim()) {
      // Search products when search term is provided
      fetchProducts({ searchKeyword: searchTerm });
    } else {
      // Fetch products by category
      const category = categories.find((cat) => cat.name === selectedCategory);
      if (category) {
        fetchProducts({ categoryId: category.category_id });
      }
    }
  }, [selectedCategory, categories, searchTerm]);

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    // Handle image path using the getFullImageUrl function for consistency
    const imagePath = getFullImageUrl(product.image_url);

    addItem({
      id: product.product_id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock_quantity, // Add stock information for quantity validation
      image: imagePath,
      category:
        categories.find((cat) => cat.category_id === product.category_id)
          ?.name || "Unknown",
    });
    openCart();
    toast.success(`${product.name} added to cart`);
  };

  const filteredProducts = products
    .filter((product) => product.is_active)
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

  // We'll use skeleton loaders instead of a full-page loading state
  // This allows the page layout to be visible while content loads

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 text-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Product <span className="text-primary">Collection</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover high-quality products tailored to your needs.
          </p>
        </div>
      </section>
      {/* Filters and Search */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between px-4">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
          {loading ? (
            // Skeleton loaders while loading
            Array(8).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`} className="overflow-hidden rounded-xl shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 col-span-full">
              <p className="text-xl text-muted-foreground font-semibold">
                No products found.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.product_id}
                className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardHeader className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={getFullImageUrl(product.image_url)}
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-white">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-extrabold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    <ProtectedAction onAction={() => handleAddToCart(product)}>
                      <Button
                        disabled={product.stock_quantity === 0}
                        className="w-full flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
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
      </section>
    </div>
  );
}
