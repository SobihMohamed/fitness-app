// Product-related types for the fitness app

// Client-facing product types
export interface ClientProduct {
  product_id: number;
  name: string;
  category_id: number;
  price: number;
  description: string;
  image_url: string | null;
  sub_images?: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCategory {
  category_id: number;
  name: string;
}

// Product filter and search types
export interface ProductFilter {
  category: string;
  sortBy: string;
  searchTerm: string;
  showFavoritesOnly: boolean;
  page: number;
  pageSize: number;
}

export interface ProductSearchParams {
  categoryId?: number;
  searchKeyword?: string;
}

// Product state management types
export interface ProductsState {
  products: ClientProduct[];
  categories: ClientCategory[];
  loading: boolean;
  favorites: Set<number>;
  filter: ProductFilter;
}

export interface ProductsActions {
  setProducts: (products: ClientProduct[]) => void;
  setCategories: (categories: ClientCategory[]) => void;
  setLoading: (loading: boolean) => void;
  updateFilter: (filter: Partial<ProductFilter>) => void;
  toggleFavorite: (productId: number) => void;
  clearFilters: () => void;
}

export interface UseProductsDataReturn {
  products: ClientProduct[];
  categories: ClientCategory[];
  loading: boolean;
  favorites: Set<number>;
  filter: ProductFilter;
  filteredProducts: ClientProduct[];
  paginatedProducts: ClientProduct[];
  totalPages: number;
  actions: ProductsActions;
}

// Product details types
export interface ProductDetailsState {
  product: ClientProduct | null;
  category: ClientCategory | null;
  relatedProducts: ClientProduct[];
  loading: boolean;
  quantity: number;
  isFavorite: boolean;
  activeImage: string | null;
}

export interface ProductDetailsActions {
  setProduct: (product: ClientProduct | null) => void;
  setCategory: (category: ClientCategory | null) => void;
  setRelatedProducts: (products: ClientProduct[]) => void;
  setLoading: (loading: boolean) => void;
  setQuantity: (quantity: number) => void;
  setIsFavorite: (isFavorite: boolean) => void;
  setActiveImage: (image: string | null) => void;
}

export interface UseProductDetailsReturn {
  state: ProductDetailsState;
  actions: ProductDetailsActions;
  handleAddToCart: () => void;
  toggleFavorite: () => void;
  handleShare: () => Promise<void>;
}

// Component props types
export interface ProductsHeroSectionProps {
  className?: string;
}

export interface ProductsFilterSectionProps {
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
  showFavoritesOnly: boolean;
  categories: ClientCategory[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onFavoritesToggle: () => void;
}

export interface ProductCardProps {
  product: ClientProduct;
  categories: ClientCategory[];
  favorites: Set<number>;
  onAddToCart: (product: ClientProduct) => void;
  onToggleFavorite: (productId: number) => void;
}

export interface ProductGridProps {
  products: ClientProduct[];
  categories: ClientCategory[];
  favorites: Set<number>;
  loading: boolean;
  onAddToCart: (product: ClientProduct) => void;
  onToggleFavorite: (productId: number) => void;
}

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface ProductDetailsImageGalleryProps {
  product: ClientProduct;
  activeImage: string | null;
  onImageChange: (image: string) => void;
}

export interface ProductDetailsInfoProps {
  product: ClientProduct;
  quantity: number;
  isFavorite: boolean;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onShare: () => Promise<void>;
}

// Admin types (existing)
export interface Category {
  category_id: string;
  name: string;
}

export interface Product {
  product_id: string;
  name: string;
  main_image_url: string;
  price: string;
  description: string;
  is_in_stock: string;
  category_id: string;
  sub_images?: string[];
}

export interface ProductFormData {
  name: string;
  category_id: string;
  price: string;
  is_in_stock: string;
  description: string;
  main_image_url: string;
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  data?: Product[];
  products?: Product[];
}

export interface ProductDeleteTarget {
  type: "category" | "product";
  id: string;
  name: string;
}

export interface ProductSearchRequest {
  keyword: string;
}

export interface ProductSearchResponse {
  success: boolean;
  data: Product[];
}

export interface CategoryFormData {
  name: string;
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data?: Category[];
  categories?: Category[];
}
