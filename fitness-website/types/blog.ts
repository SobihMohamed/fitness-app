export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categoryId: string;
  categoryName?: string;
  status: "archived" | "published" | string;
  videoUrl?: string;
  createdAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  blogCount?: number;
}

export interface Blog {
  blog_id: string;
  title: string;
  video_link: string | null;
  main_image: string | null;
  content: string;
  created_at: string;
  status: 'archived' | 'published';
  admin_id: string;
  category_id: string | null;
}

export interface BlogFormData {
  title: string;
  content: string;
  status: 'archived' | 'published';
  video_link: string;
  category_id: string;
  main_image: File | string | null;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface BlogApiResponse extends ApiResponse<BlogPost | BlogPost[]> {
  blogs?: BlogPost[];
}

export interface CategoryApiResponse extends ApiResponse<BlogCategory | BlogCategory[]> {
  categories?: BlogCategory[];
}

export interface BlogTableProps {
  blogs: Blog[];
  categories: BlogCategory[];
  categoryTitleById: Record<string, string>;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export interface CategoryPillsProps {
  categories: BlogCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  maxPrimary?: number;
}

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatus: "all" | "archived" | "published";
  onStatusChange: (status: "all" | "archived" | "published") => void;
  filteredBlogsCount: number;
  onClearFilters: () => void;
  loading: {
    initial: boolean;
    blogs: boolean;
    categories: boolean;
    form: boolean;
  };
}

export interface StatsCardsProps {
  blogs: Blog[];
}

export interface BlogFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingBlog: Blog | null;
  formData: BlogFormData;
  onFormDataChange: (data: BlogFormData) => void;
  categories: BlogCategory[];
  selectedImage: File | null;
  onImageChange: (file: File | null) => void;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: BlogCategory | null;
  formData: {
    title: string;
    description: string;
  };
  onFormDataChange: (data: { title: string; description: string }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    id: string;
    name: string;
    title?: string;
    type?: string;
  } | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export interface BlogFilters {
  searchTerm: string;
  selectedStatus: "all" | "archived" | "published";
  selectedCategory: string;
  sortByDate: "desc" | "asc";
}

export interface BlogState {
  blogs: Blog[];
  categories: BlogCategory[];
  remoteSearchBlogs: Blog[] | null;
  loading: {
    blogs: boolean;
    categories: boolean;
    form: boolean;
    initial: boolean;
  };
  filters: BlogFilters;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  categoryPagination: {
    currentPage: number;
    categoriesPerPage: number;
  };
}

export interface BlogFiltersProps {
  selectedCategory: string;
  searchTerm: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (term: string) => void;
  onSortChange: (sort: string) => void;
  categories: BlogCategory[];
  loading?: boolean;
}

export interface BlogCardProps {
  blog: BlogPost;
  categoryName?: string;
  featured?: boolean;
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

export interface BlogGridProps {
  blogs: BlogPost[];
  loading?: boolean;
  featured?: boolean;
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

export interface BlogSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export interface BlogHeroSectionProps {
  featuredPost?: BlogPost;
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

export interface BlogFilterSectionProps {
  selectedCategory: string;
  searchTerm: string;
  sortBy: string;
  categories: Array<{
    id?: string;
    name: string;
    count: number;
    color: string;
  }>;
  onCategoryChange: (category: string) => void;
  onSearchChange: (term: string) => void;
  onSortChange: (sort: string) => void;
  loading?: boolean;
}

export interface BlogDetailsState {
  blog: BlogPost | null;
  relatedBlogs: BlogPost[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  showVideoModal: boolean;
  watchRequested: boolean;
}

export interface BlogDetailsActions {
  fetchBlog: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setShowVideoModal: (show: boolean) => void;
  setWatchRequested: (requested: boolean) => void;
}

export interface UseBlogsDataReturn {
  blogs: BlogPost[];
  allBlogs: BlogPost[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedCategoryId: string | null;
  searchTerm: string;
  sortBy: string;
  searchLoading: boolean;
  filteredBlogs: BlogPost[];
  sortedBlogs: BlogPost[];
  featuredPost: BlogPost | undefined;
  regularPosts: BlogPost[];
  categoryStats: Array<{
    id?: string;
    name: string;
    count: number;
    color: string;
  }>;
  fetchBlogs: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchBlogs: (query: string) => Promise<void>;
  fetchBlogsByCategory: (categoryId: string, categoryName?: string) => Promise<void>;
  handleCategorySelect: (categoryName: string) => void;
  handleCategorySelectById: (categoryId: string, categoryName: string) => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: string) => void;
  getPostCategoryName: (post: BlogPost) => string;
  formatDate: (dateString: string) => string;
  getImageUrl: (imagePath?: string) => string | null;
}

export interface UseBlogDetailsReturn {
  blog: BlogPost | null;
  relatedBlogs: BlogPost[];
  loading: boolean;
  error: string | null;
  categories: BlogCategory[];
  showVideoModal: boolean;
  watchRequested: boolean;
  fetchBlog: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchRelatedBlogs: (categoryKey?: string) => Promise<void>;
  setShowVideoModal: (show: boolean) => void;
  setWatchRequested: (requested: boolean) => void;
  getCategoryName: (categoryId?: string) => string;
  getImageUrl: (imagePath?: string) => string | null;
  formatDate: (dateString?: string) => string;
  renderVideo: (url?: string, autoplay?: boolean) => string;
}

export interface ClientBlogState {
  blogs: BlogPost[];
  allBlogs: BlogPost[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedCategoryId: string | null;
  searchTerm: string;
  sortBy: string;
  searchLoading: boolean;
}

export interface BlogActions {
  fetchBlogs: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<BlogFilters>) => void;
  setPagination: (page: number) => void;
  setCategoryPagination: (page: number) => void;
}

export interface BlogPageProps {
  initialBlogs?: BlogPost[];
  initialCategories?: BlogCategory[];
}

export interface BlogDetailsPageProps {
  params: { id: string };
  searchParams?: { watch?: string };
}
