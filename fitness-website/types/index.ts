// Barrel file for types
// Re-export all types so imports can use `@/types`
export * from './request';
export * from './product';
// Explicitly re-export blog types to avoid name conflicts with product types
export type {
  BlogPost,
  BlogCategory,
  Blog,
  BlogFormData,
  BlogApiResponse,
  // Alias to avoid conflict with product's CategoryApiResponse
  CategoryApiResponse as BlogCategoryApiResponse,
  BlogTableProps,
  CategoryPillsProps,
  SearchAndFilterProps,
  StatsCardsProps,
  BlogFormProps,
  CategoryFormProps,
  DeleteConfirmationProps,
  BlogFilters,
  BlogState,
  BlogFiltersProps,
  BlogCardProps,
  BlogGridProps,
  BlogSearchProps,
  BlogHeroSectionProps,
  BlogFilterSectionProps,
  BlogDetailsState,
  BlogDetailsActions,
  UseBlogsDataReturn,
  UseBlogDetailsReturn,
  ClientBlogState,
  BlogActions,
  BlogPageProps,
  BlogDetailsPageProps,
} from './blog';
export * from './course';
export * from './dashboard';
export * from './home';
export * from './promocode';
export * from './service';
export * from './user';
