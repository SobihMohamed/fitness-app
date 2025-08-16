"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ShoppingCart, Search, Filter, Star, Heart } from "lucide-react";
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

interface Category {
  category_id: number;
  name: string;
}

export default function ProductsPage() {
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const {
    TARGET_URL: API_TARGET,
    USER_PRODUCTS_API,
    USER_FUNCTIONS,
  } = API_CONFIG;

  const getFullImageUrl = useCallback(
    (imagePath: string | null) => {
      if (!imagePath) return "/diverse-products-still-life.png";
      if (imagePath.startsWith("http")) return imagePath;
      return `${API_TARGET}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
    },
    [API_TARGET]
  );

  const normalizeProductData = useCallback(
    (item: any): Product => ({
      product_id: Number.parseInt(item.product_id || item.id, 10),
      name: item.name,
      category_id: Number.parseInt(item.category_id || item.cat_id, 10),
      price: Number.parseFloat(item.price),
      description: item.description,
      image_url: item.image_url || item.image || null,
      stock_quantity:
        Number.parseInt(
          item.stock_quantity || item.is_in_stock || item.quantity,
          10
        ) || 0,
      is_active: item.is_active !== undefined ? item.is_active : true,
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
    }),
    []
  );

  const fetchProducts = useCallback(
    async ({
      categoryId,
      searchKeyword,
    }: {
      categoryId?: number;
      searchKeyword?: string;
    } = {}) => {
      setLoading(true);
      try {
        let response;

        if (searchKeyword && searchKeyword.trim()) {
          response = await axios.post(USER_PRODUCTS_API.search, {
            keyword: searchKeyword,
          });
        } else if (categoryId) {
          response = await axios.get(
            USER_FUNCTIONS.UserCategory.getproductsByCategoryId(
              categoryId.toString()
            )
          );
        } else {
          response = await axios.get(USER_PRODUCTS_API.getAll);
        }

        const result = response.data;
        let rawData = [];
        if (Array.isArray(result)) {
          rawData = result;
        } else if (result && typeof result === "object") {
          rawData = result.data || result.products || [];
        }

        const data = rawData.map(normalizeProductData);
        setProducts(data);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        const errorMessage =
          error.response?.data?.message ||
          (searchKeyword
            ? "Search failed"
            : categoryId
            ? "Failed to load products by category"
            : "Failed to load products");
        toast.error(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [USER_PRODUCTS_API, USER_FUNCTIONS, normalizeProductData]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        USER_FUNCTIONS.UserCategory.getAllCategory
      );
      const result = response.data;
      const rawData = result.data || result.categories || result || [];
      const data = rawData.map((item: any) => ({
        category_id: Number.parseInt(item.category_id || item.id, 10),
        name: item.name,
      }));
      setCategories(data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  }, [USER_FUNCTIONS]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory === "All" && !searchTerm.trim()) {
      fetchProducts();
    } else if (searchTerm.trim()) {
      fetchProducts({ searchKeyword: searchTerm });
    } else {
      const category = categories.find((cat) => cat.name === selectedCategory);
      if (category) {
        fetchProducts({ categoryId: category.category_id });
      }
    }
  }, [selectedCategory, categories, searchTerm, fetchProducts]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (product.stock_quantity <= 0) {
        toast.error("This product is out of stock");
        return;
      }

      const imagePath = getFullImageUrl(product.image_url);
      const categoryName =
        categories.find((cat) => cat.category_id === product.category_id)
          ?.name || "Unknown";

      addItem({
        id: product.product_id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock_quantity,
        image: imagePath,
        category: categoryName,
      });

      openCart();
      toast.success(`${product.name} added to cart`);
    },
    [addItem, openCart, categories, getFullImageUrl]
  );

  const toggleFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(productId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products
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
  }, [products, sortBy]);

  const SkeletonCard = useMemo(
    () => (
      <Card className="overflow-hidden rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-0">
          <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-t-2xl" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-6 w-3/4 bg-muted rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-full bg-muted/70 rounded animate-pulse mb-2" />
          <div className="h-4 w-2/3 bg-muted/70 rounded animate-pulse mb-6" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-1/3 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-1/4 bg-muted/70 rounded animate-pulse" />
          </div>
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Premium Collection
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Discover Amazing
            <span className="block text-primary">Products</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of high-quality products designed to
            enhance your lifestyle.
          </p>
        </div>
      </section>

      <section className="py-8 border-y bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 focus:border-primary/50 bg-background/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl border-2 bg-background/80 backdrop-blur-sm">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
                <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl border-2 bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              Array(12)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`}>{SkeletonCard}</div>
                ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                      <Image
                        src={
                          getFullImageUrl(product.image_url) ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.product_id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            favorites.has(product.product_id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        />
                      </Button>

                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Badge
                            variant="destructive"
                            className="text-white font-semibold px-4 py-2 rounded-xl"
                          >
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <CardTitle className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                          ${product.price.toFixed(2)}
                        </span>
                        <Badge
                          variant={
                            product.stock_quantity > 10
                              ? "secondary"
                              : product.stock_quantity > 0
                              ? "outline"
                              : "destructive"
                          }
                          className="rounded-full px-3 py-1"
                        >
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} left`
                            : "Out of stock"}
                        </Badge>
                      </div>

                      <ProtectedAction
                        onAction={() => handleAddToCart(product)}
                      >
                        <Button
                          disabled={product.stock_quantity === 0}
                          className="w-full h-12 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
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
        </div>
      </section>
    </div>
  );
}
