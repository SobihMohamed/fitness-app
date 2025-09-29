import { ComponentType } from "react";

// API Response interfaces
export interface UsersApiResponse {
  status: string;
  data: any[];
}

export interface OrdersApiResponse {
  status: string;
  data: any[];
}

export interface TrainingApiResponse {
  status: string;
  data: any[];
}

export interface CoursesApiResponse {
  status: string;
  data: any[];
}

// Dashboard Stats
export interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: ComponentType<any>;
  color: string;
}

// Dashboard Widgets
export interface RecentActivity {
  action: string;
  item: string;
  time: string;
  type: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
}

// Dashboard Analytics
export interface DashboardUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
}

// Chart Data
export interface RequestPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
}

// Hook Return Type
export interface UseDashboardDataReturn {
  loading: boolean;
  stats: StatCard[];
  userStats: DashboardUserStats | null;
  orderStats: OrderStats | null;
  requestsOverTime: RequestPoint[];
  rolesDistribution: RoleCount[];
  error: string | null;
}

// Component Props
export interface DashboardStatsCardsProps {
  stats: StatCard[];
  adminCount: number;
}

export interface UserStatisticsProps {
  userStats: DashboardUserStats | null;
  adminCount: number;
}

export interface RequestsChartProps {
  requestsOverTime: RequestPoint[];
  isMounted: boolean;
}

export interface RolesChartProps {
  rolesDistribution: RoleCount[];
  isMounted: boolean;
}

export interface QuickActionsProps {
  // No specific props needed
}

export interface OrderStatisticsProps {
  orderStatusData: OrderStatusData[];
  isMounted: boolean;
}

// Dashboard Management State
export interface DashboardManagementState {
  loading: boolean;
  error: string | null;
  isMounted: boolean;
}

export interface DashboardManagementActions {
  // Actions can be added here if needed for future enhancements
}

export interface DashboardManagementReturn extends DashboardManagementState, DashboardManagementActions {
  // Combined return type for dashboard management hook
}
