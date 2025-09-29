// User types for the fitness app admin panel

export interface UserType {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  country?: string;
  user_type: string;
  created_at: string;
  is_active?: string;
}

export interface AdminType {
  admin_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  is_active?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  password: string;
  user_type: string;
  role: string;
}

export interface UserApiResponse {
  data?: UserType[] | AdminType[];
  users?: UserType[] | AdminType[];
  admins?: AdminType[];
  success?: boolean;
  message?: string;
}

export interface UserDeleteTarget {
  type: "user" | "admin";
  id: string;
  name: string;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  recentUsers: number;
}

export interface UserManagementState {
  users: UserType[];
  admins: AdminType[];
  loading: {
    initial: boolean;
    users: boolean;
    admins: boolean;
    submitting: boolean;
    deleting: boolean;
  };
  searchTerm: string;
  debouncedSearchTerm: string;
  selectedType: string;
  currentPage: number;
}

export interface UserManagementActions {
  fetchUsers: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  refreshData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  addUser: (formData: UserFormData) => Promise<void>;
  updateUser: (userId: string, formData: UserFormData, type: "user" | "admin") => Promise<void>;
  deleteUser: (userId: string, type: "user" | "admin") => Promise<void>;
  checkEmailExists: (email: string, excludeId?: string) => boolean;
  checkPhoneExists: (phone: string, excludeId?: string) => boolean;
}

export interface CombinedUserData extends UserType {
  type: "user";
}

export interface CombinedAdminData extends AdminType {
  type: "admin";
  country?: string; // Add country field to admin data for consistency
}

export type CombinedUserItem = CombinedUserData | CombinedAdminData;

export interface UserManagementReturn extends UserManagementState, UserManagementActions {
  filteredData: CombinedUserItem[];
  paginatedData: CombinedUserItem[];
  totalPages: number;
  stats: UserStats;
}
