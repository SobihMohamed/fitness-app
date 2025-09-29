// PromoCode types mirrored from backend model `promo_codes`
export interface PromoCode {
  promoCode_id: string;
  promo_code: string;
  start_date: string; 
  end_date: string;   
  percentage_of_discount: string | number; 
  created_at?: string;
}

// Form data for creating/editing promo codes
export interface PromoCodeFormData {
  promo_code: string;
  start_date: string;
  end_date: string;
  percentage_of_discount: string;
}

// API response types
export interface PromoCodeApiResponse {
  success: boolean;
  message?: string;
  data?: PromoCode[] | PromoCode;
}

// Delete target type
export interface PromoCodeDeleteTarget {
  promoCode_id: string;
  promo_code: string;
}

// Stats for promo codes
export interface PromoCodeStats {
  total: number;
  active: number;
  expired: number;
  upcoming: number;
}

// State management types
export interface PromoCodeManagementState {
  promoCodes: PromoCode[];
  loading: boolean;
  submitting: boolean;
  search: string;
  isDialogOpen: boolean;
  editing: PromoCode | null;
  confirmDelete: PromoCode | null;
  form: PromoCodeFormData;
}

// Action types for state management
export interface PromoCodeManagementActions {
  loadPromoCodes: () => Promise<void>;
  openAdd: () => void;
  openEdit: (promoCode: PromoCode) => void;
  savePromoCode: () => Promise<void>;
  deletePromoCode: () => Promise<void>;
  setSearch: (search: string) => void;
  setIsDialogOpen: (open: boolean) => void;
  setConfirmDelete: (promoCode: PromoCode | null) => void;
  validateForm: () => boolean;
}

// Combined return type for the management hook
export interface PromoCodeManagementReturn extends PromoCodeManagementState, PromoCodeManagementActions {
  filteredPromoCodes: PromoCode[];
  isActive: (promoCode: PromoCode) => boolean;
  updateForm: (field: keyof PromoCodeFormData, value: string) => void;
}
