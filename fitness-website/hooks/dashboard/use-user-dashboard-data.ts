"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  user_type: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

interface SubscribedCourse {
  id: string;
  title: string;
  description: string;
  image?: string;
  progress?: number;
  total_modules?: number;
  completed_modules?: number;
  enrolled_at: string;
  status: string;
}

interface TrainingRequest {
  id: string;
  service_name?: string;
  trainer_name?: string;
  status: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

interface CourseRequest {
  id: string;
  course_name?: string;
  status: string;
  created_at: string;
  approved_at?: string;
  notes?: string;
}

export function useDashboardData(user: any) {
  console.log("🔍 USER useDashboardData hook called with user:", !!user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscribedCourses, setSubscribedCourses] = useState<SubscribedCourse[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);
  
  const [loading, setLoading] = useState({
    profile: !user, // Only show loading if we don't have user data
    orders: !user,
    notifications: !user,
    courses: !user,
    requests: !user,
  });

  // Default actions to prevent undefined errors
  const defaultActions = {
    loadProfile: async () => {},
    loadOrders: async () => {},
    loadNotifications: async () => {},
    loadSubscribedCourses: async () => {},
    loadRequests: async () => {},
    updateProfile: async () => {},
    markNotificationAsRead: async () => {},
    deleteNotification: async () => {},
    refreshAll: async () => {},
  };

  const getAuthHeaders = useCallback(() => {
    const token = sessionStorage.getItem("token");
    console.log("🔑 Auth Debug:", { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null
    });
    if (!token) throw new Error("No authentication token found");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      const headers = getAuthHeaders();
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.user.profile, { headers });

      let profileData = response.data;
      if (response.data.user) profileData = response.data.user;
      else if (response.data.data) profileData = response.data.data;

      setProfile({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        country: profileData.country || "",
        user_type: profileData.user_type || "",
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      if (user) {
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          country: user.country || "",
          user_type: user.user_type || "",
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [user, getAuthHeaders]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      const headers = getAuthHeaders();
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.orders.getMyOrders, { headers });

      console.log("🔍 Raw orders response:", response.data);
      const ordersData = response.data.orders || response.data.data || response.data || [];
      console.log("🔍 Orders data array:", ordersData);
      
      const normalized = (Array.isArray(ordersData) ? ordersData : []).map((raw: any) => {
        console.log("🔍 Processing order:", raw);
        const order = {
          id: String(raw.id || raw.order_id || raw._id || Math.random()),
          total_price: Number(raw.total_price || raw.net_total || raw.total || raw.amount || 0),
          status: String(raw.status || raw.status_name || raw.state || "unknown"),
          created_at: String(raw.created_at || raw.purchase_date || raw.createdAt || raw.date || new Date().toISOString()),
          products: Array.isArray(raw.products || raw.items)
            ? (raw.products || raw.items).map((p: any) => ({
                id: String(p.id || p.product_id || Math.random()),
                name: p.name || p.title || "Product",
                price: Number(p.price || p.unit_price || p.net_price || 0),
                quantity: Number(p.quantity || p.qty || 1),
              }))
            : undefined,
        } as Order;
        console.log("🔍 Normalized order:", order);
        return order;
      });
      
      console.log("🔍 Final normalized orders:", normalized);
      setOrders(normalized);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, [getAuthHeaders]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      const headers = getAuthHeaders();
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.notifications.getAll, { headers });

      console.log("🔍 Raw notifications response:", response.data);
      const notificationsData = response.data?.notifications || response.data?.data || response.data || [];
      console.log("🔍 Notifications data array:", notificationsData);
      
      const normalized = (Array.isArray(notificationsData) ? notificationsData : []).map((raw: any) => {
        console.log("🔍 Processing notification:", raw);
        const readRaw = raw?.is_read ?? raw?.isRead ?? raw?.read ?? raw?.seen;
        const isRead = readRaw === true || readRaw === 1 || readRaw === "1" || readRaw === "true" || readRaw === "yes";
        const notification = {
          id: String(raw?.id ?? raw?.notification_id ?? raw?._id ?? Math.random()),
          title: String(raw?.title ?? raw?.message_title ?? raw?.subject ?? "Notification"),
          message: String(raw?.message ?? raw?.content ?? raw?.body ?? ""),
          is_read: !!isRead,
          created_at: String(raw?.created_at ?? raw?.delivered_at ?? raw?.createdAt ?? new Date().toISOString()),
          type: raw?.type ?? raw?.category ?? undefined,
        } as Notification;
        console.log("🔍 Normalized notification:", notification);
        return notification;
      }).filter((n: Notification) => n.id && n.id !== "NaN");

      console.log("🔍 Final normalized notifications:", normalized);
      setNotifications(normalized);
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [getAuthHeaders]);

  const loadSubscribedCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const headers = getAuthHeaders();
      const response = await axios.get(API_CONFIG.USER_FUNCTIONS.courses.allSubscribedCourses, { headers });

      console.log("🔍 Raw courses response:", response.data);
      const coursesData = response.data?.courses || response.data?.data || response.data || [];
      console.log("🔍 Courses data array:", coursesData);
      
      const normalized = (Array.isArray(coursesData) ? coursesData : []).map((raw: any) => {
        console.log("🔍 Processing course:", raw);
        const course = {
          id: String(raw.id || raw.course_id || Math.random()),
          title: String(raw.title || raw.name || "Course"),
          description: String(raw.description || ""),
          image: raw.image || raw.thumbnail,
          progress: Number(raw.progress || 0),
          total_modules: Number(raw.total_modules || 0),
          completed_modules: Number(raw.completed_modules || 0),
          enrolled_at: String(raw.enrolled_at || raw.created_at || new Date().toISOString()),
          status: String(raw.status || "active"),
        } as SubscribedCourse;
        console.log("🔍 Normalized course:", course);
        return course;
      });

      console.log("🔍 Final normalized courses:", normalized);
      setSubscribedCourses(normalized);
    } catch (error: any) {
      console.error("Failed to load subscribed courses:", error);
      setSubscribedCourses([]);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, [getAuthHeaders]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      const headers = getAuthHeaders();
      
      let normalizedTraining: TrainingRequest[] = [];
      let normalizedCourse: CourseRequest[] = [];

      // Load training requests with error handling
      try {
        console.log("🔍 Loading training requests...");
        let trainingResponse;
        try {
          // Try POST first
          trainingResponse = await axios.post(API_CONFIG.USER_FUNCTIONS.requests.training.getMyRequests, {}, { headers });
        } catch (postError: any) {
          if (postError.response?.status === 404 || postError.response?.status === 405) {
            console.log("🔍 POST failed, trying GET for training requests...");
            // Try GET as fallback
            trainingResponse = await axios.get(API_CONFIG.USER_FUNCTIONS.requests.training.getMyRequests, { headers });
          } else {
            throw postError;
          }
        }
        console.log("🔍 Raw training requests response:", trainingResponse.data);
        
        const trainingData = trainingResponse.data?.requests || trainingResponse.data?.data || trainingResponse.data || [];
        console.log("🔍 Training data array:", trainingData);
        
        normalizedTraining = (Array.isArray(trainingData) ? trainingData : []).map((raw: any) => {
          console.log("🔍 Processing training request:", raw);
          const request = {
            id: String(raw.id || raw.request_id || Math.random()),
            service_name: raw.service_name || raw.service?.name,
            trainer_name: raw.trainer_name || raw.trainer?.name,
            status: String(raw.status || "pending"),
            created_at: String(raw.created_at || new Date().toISOString()),
            start_date: raw.start_date,
            end_date: raw.end_date,
            notes: raw.notes,
          } as TrainingRequest;
          console.log("🔍 Normalized training request:", request);
          return request;
        });
      } catch (trainingError: any) {
        console.warn("🔍 Training requests endpoint not available:", {
          status: trainingError.response?.status,
          message: trainingError.message,
          url: API_CONFIG.USER_FUNCTIONS.requests.training.getMyRequests
        });
        normalizedTraining = [];
      }

      // Load course requests with error handling
      try {
        console.log("🔍 Loading course requests...");
        let courseResponse;
        try {
          // Try POST first
          courseResponse = await axios.post(API_CONFIG.USER_FUNCTIONS.requests.courses.getMyRequests, {}, { headers });
        } catch (postError: any) {
          if (postError.response?.status === 404 || postError.response?.status === 405) {
            console.log("🔍 POST failed, trying GET for course requests...");
            // Try GET as fallback
            courseResponse = await axios.get(API_CONFIG.USER_FUNCTIONS.requests.courses.getMyRequests, { headers });
          } else {
            throw postError;
          }
        }
        console.log("🔍 Raw course requests response:", courseResponse.data);
        
        const courseData = courseResponse.data?.requests || courseResponse.data?.data || courseResponse.data || [];
        console.log("🔍 Course requests data array:", courseData);
        
        normalizedCourse = (Array.isArray(courseData) ? courseData : []).map((raw: any) => {
          console.log("🔍 Processing course request:", raw);
          const request = {
            id: String(raw.id || raw.request_id || Math.random()),
            course_name: raw.course_name || raw.course?.title,
            status: String(raw.status || "pending"),
            created_at: String(raw.created_at || new Date().toISOString()),
            approved_at: raw.approved_at,
            notes: raw.notes,
          } as CourseRequest;
          console.log("🔍 Normalized course request:", request);
          return request;
        });
      } catch (courseError: any) {
        console.warn("🔍 Course requests endpoint not available:", {
          status: courseError.response?.status,
          message: courseError.message,
          url: API_CONFIG.USER_FUNCTIONS.requests.courses.getMyRequests
        });
        normalizedCourse = [];
      }

      console.log("🔍 Final normalized training requests:", normalizedTraining);
      console.log("🔍 Final normalized course requests:", normalizedCourse);
      
      setTrainingRequests(normalizedTraining);
      setCourseRequests(normalizedCourse);
    } catch (error: any) {
      console.error("Failed to load requests:", error);
      setTrainingRequests([]);
      setCourseRequests([]);
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  }, [getAuthHeaders]);

  const updateProfile = useCallback(async (data: ProfileData & { password?: string }) => {
    const headers = getAuthHeaders();
    const payload: any = {
      name: data.name?.trim() ?? "",
      email: data.email?.trim() ?? "",
      phone: data.phone?.trim() ?? "",
      address: data.address?.trim() ?? "",
      country: data.country?.trim() ?? "",
    };
    if (data.password && data.password.trim().length > 0) {
      payload.password = data.password.trim();
    }

    await axios.post(API_CONFIG.USER_FUNCTIONS.user.updateProfile, payload, { headers });
    toast.success("Profile updated successfully.");
    await loadProfile();
  }, [getAuthHeaders, loadProfile]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(API_CONFIG.USER_FUNCTIONS.notifications.markAsRead(id), {}, { headers });
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [getAuthHeaders]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(API_CONFIG.USER_FUNCTIONS.notifications.delete(id), { headers });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast.success("Notification deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  }, [getAuthHeaders]);

  const loadAllData = useCallback(async () => {
    try {
      console.log("🔍 loadAllData started - calling all data loading functions...");
      
      // Load data with individual error handling to prevent one failure from blocking others
      const results = await Promise.allSettled([
        loadProfile(),
        loadOrders(),
        loadNotifications(),
        loadSubscribedCourses(),
        loadRequests()
      ]);

      // Log results for debugging
      results.forEach((result, index) => {
        const functionNames = ['loadProfile', 'loadOrders', 'loadNotifications', 'loadSubscribedCourses', 'loadRequests'];
        if (result.status === 'rejected') {
          console.warn(`🔍 ${functionNames[index]} failed:`, result.reason);
        } else {
          console.log(`🔍 ${functionNames[index]} completed successfully`);
        }
      });
      
      console.log("🔍 loadAllData completed - some functions may have failed but others succeeded");
    } catch (error) {
      console.error("🔍 Error loading dashboard data:", error);
    }
  }, [loadProfile, loadOrders, loadNotifications, loadSubscribedCourses, loadRequests]);

  useEffect(() => {
    console.log("🔍 useDashboardData useEffect triggered:", { 
      user: !!user, 
      userId: user?.id,
      hasLoadAllData: !!loadAllData 
    });
    if (user && user.id) {
      console.log("🔍 Starting to load all dashboard data...");
      loadAllData();
    } else {
      console.log("🔍 Not loading data - user not ready:", { user: !!user, userId: user?.id });
    }
  }, [user, loadAllData]);

  return {
    profile,
    orders: orders || [],
    notifications: notifications || [],
    subscribedCourses: subscribedCourses || [],
    trainingRequests: trainingRequests || [],
    courseRequests: courseRequests || [],
    loading: loading || {
      profile: false,
      orders: false,
      notifications: false,
      courses: false,
      requests: false,
    },
    actions: user ? {
      loadProfile,
      loadOrders,
      loadNotifications,
      loadSubscribedCourses,
      loadRequests,
      updateProfile,
      markNotificationAsRead,
      deleteNotification,
      refreshAll: loadAllData,
    } : defaultActions
  };
}
