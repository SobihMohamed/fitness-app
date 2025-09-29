// Request-related types for the admin requests page

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface TrainingRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  age: number;
  start_date: string;
  end_date: string;
  training_per_week: number;
  training_place: string;
  weight: number;
  height: number;
  injury_details: string;
  diseases_details: string;
  goal_description: string;
  status: "pending" | "approved" | "cancelled";
  created_at: string;
  [key: string]: any;
}

export interface CourseEnrollmentRequest {
  id: string;
  user_id: string;
  course_name: string;
  course_price: number;
  student_name: string;
  status: "pending" | "approved" | "cancelled";
  created_at: string;
  [key: string]: any;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  total_price: number;
  status: "pending" | "approved" | "cancelled";
  created_at: string;
  order_items: OrderItem[];
  [key: string]: any;
}

export type RequestItem = TrainingRequest | CourseEnrollmentRequest | Order;

export type RequestStatus = "pending" | "approved" | "cancelled";

export type RequestSection = "training" | "courses" | "orders";

export interface SearchFilters {
  query: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: 'created_at' | 'status' | 'user_id';
  sortOrder: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'approve' | 'cancel' | 'delete';
  ids: string[];
}

export interface RequestsApiResponse {
  data?: RequestItem[];
  requests?: RequestItem[];
  orders?: RequestItem[];
  [key: string]: any;
}

export interface StatusCounts {
  pending: number;
  approved: number;
  cancelled: number;
}

export interface RequestDetailsData {
  [key: string]: any;
}

export interface ConfirmAction {
  type: "approve" | "cancel" | "delete";
  id: string;
}
