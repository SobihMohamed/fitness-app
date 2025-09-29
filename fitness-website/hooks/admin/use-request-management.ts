"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { requestsApi } from "@/lib/api/requests";
import { useAdminApi } from "./use-admin-api";
import type {
  RequestItem,
  RequestSection,
  SearchFilters,
  BulkAction,
  ConfirmAction,
  StatusCounts,
  RequestDetailsData
} from "@/types";

interface RequestManagementState {
  data: any;
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  detailsItem: RequestItem | null;
  detailsData: RequestDetailsData | null;
  detailsLoading: boolean;
  detailsProduct: any;
  detailsProductName: string;
  confirm: ConfirmAction | null;
  bulkAction: BulkAction | null;
  selectedItems: string[];
  page: number;
  rowsPerPage: number;
  filters: SearchFilters;
  // Local overrides to force immediate UI updates for status when optimistic update can't find the record
  localStatusOverrides: Record<string, string>;
}

interface RequestManagementActions {
  setData: (data: any) => void;
  setPage: (page: number) => void;
  setFilters: (filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  setConfirm: (confirm: ConfirmAction | null) => void;
  setBulkAction: (action: BulkAction | null) => void;
  setDetailsItem: (item: RequestItem | null) => void;
  fetchDetails: (section: RequestSection, id: string) => Promise<void>;
  handleAction: (type: "approve" | "cancel" | "delete", id: string, section: RequestSection) => Promise<void>;
  handleBulkAction: (action: BulkAction, section: RequestSection) => Promise<void>;
  refreshData: (section: RequestSection) => Promise<void>;
}

interface RequestManagementReturn extends RequestManagementState, RequestManagementActions {
  items: RequestItem[];
  filtered: RequestItem[];
  totalPages: number;
  paginated: RequestItem[];
  statusCounts: StatusCounts;
  debouncedQuery: string;
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useRequestManagement(section: RequestSection): RequestManagementReturn {
  const { showSuccessToast, showErrorToast } = useAdminApi();

  // State
  const [state, setState] = useState<RequestManagementState>({
    data: null,
    loading: false,
    error: null,
    actionLoading: null,
    detailsItem: null,
    detailsData: null,
    detailsLoading: false,
    detailsProduct: null,
    detailsProductName: "",
    confirm: null,
    bulkAction: null,
    selectedItems: [],
    page: 1,
    rowsPerPage: 20,
    filters: {
      query: "",
      status: "all",
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    localStatusOverrides: {}
  });

  // Debounced search for better performance
  const debouncedQuery = useDebounce(state.filters.query, 300);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = {
        page: state.page,
        per_page: state.rowsPerPage,
        search: debouncedQuery || undefined,
        status: state.filters.status !== "all" ? state.filters.status : undefined,
        date_from: state.filters.dateFrom?.toISOString().split('T')[0],
        date_to: state.filters.dateTo?.toISOString().split('T')[0],
        sort_by: state.filters.sortBy,
        sort_order: state.filters.sortOrder,
      };

      const data = await requestsApi.fetchRequests(section, params);
      // Keep overrides for items where the server still doesn't reflect the desired status
      const normalizedItems = requestsApi.normalizeRequestData(data);
      setState(prev => {
        const nextOverrides: Record<string, string> = {};
        if (prev.localStatusOverrides && typeof prev.localStatusOverrides === 'object') {
          for (const [idStr, desired] of Object.entries(prev.localStatusOverrides)) {
            const item = normalizedItems.find((it: any) => String(it?.id || it?.request_id || it?.order_id) === idStr);
            const serverStatus = item ? requestsApi.normalizeStatus(item) : undefined;
            if (!item || serverStatus !== desired) {
              nextOverrides[idStr] = desired;
            }
          }
        }
        return { ...prev, data, loading: false, localStatusOverrides: nextOverrides };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network or server error. Please check your backend and try again.";
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [section, state.page, state.rowsPerPage, debouncedQuery, state.filters]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized data processing for better performance
  const { items, filtered, totalPages, paginated, statusCounts } = useMemo(() => {
    // Normalize data structure
    const normalizedItems = requestsApi.normalizeRequestData(state.data);
    
    // Advanced filtering with multiple criteria
    const filteredItems = normalizedItems.filter((item: RequestItem) => {
      // Search filter - check all string values
      const searchStr = debouncedQuery.toLowerCase();
      const matchesSearch = debouncedQuery
        ? Object.values(item).some((v) =>
            typeof v === 'string' && v.toLowerCase().includes(searchStr)
          )
        : true;
      
      // Status filter
      const itemStatus = item.status || 'pending';
      const matchesStatus = state.filters.status === "all" || itemStatus.toLowerCase() === state.filters.status.toLowerCase();
      
      // Date range filter
      const itemDate = requestsApi.extractDate(item);
      const itemDateObj = itemDate ? new Date(itemDate) : null;
      const matchesDateRange = !state.filters.dateFrom || !state.filters.dateTo || !itemDateObj || 
        (itemDateObj >= state.filters.dateFrom && itemDateObj <= state.filters.dateTo);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    // Advanced sorting
    // Apply local status overrides before sorting/pagination
    const withOverrides = filteredItems.map((it: any) => {
      const itemId = it?.id || it?.request_id || it?.order_id;
      const override = itemId != null ? state.localStatusOverrides[String(itemId)] : undefined;
      return override ? { ...it, status: override } : it;
    });

    const sortedItems = [...withOverrides].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.filters.sortBy) {
        case 'created_at':
          aValue = new Date(requestsApi.extractDate(a) || 0);
          bValue = new Date(requestsApi.extractDate(b) || 0);
          break;
        case 'status':
          aValue = a.status || 'pending';
          bValue = b.status || 'pending';
          break;
        case 'user_id':
          aValue = a.user_id || '';
          bValue = b.user_id || '';
          break;
        default:
          return 0;
      }
      
      if (state.filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Calculate pagination
    const total = Math.ceil(sortedItems.length / state.rowsPerPage);
    const paginatedItems = sortedItems.slice(
      (state.page - 1) * state.rowsPerPage,
      state.page * state.rowsPerPage
    );
    
    const statusCounts = sortedItems.reduce(
      (acc: StatusCounts, it: any) => {
        const s = (it.status || 'pending').toString().toLowerCase();
        if (s === 'approved') acc.approved += 1;
        else if (s === 'cancelled') acc.cancelled += 1;
        else acc.pending += 1;
        return acc;
      },
      { pending: 0, approved: 0, cancelled: 0 }
    );
    
    return {
      items: normalizedItems as RequestItem[],
      filtered: sortedItems,
      totalPages: total,
      paginated: paginatedItems,
      statusCounts,
    };
  }, [state.data, debouncedQuery, state.filters, state.page, state.rowsPerPage, state.localStatusOverrides]);

  // Fetch request details
  const fetchDetails = useCallback(async (requestSection: RequestSection, id: string) => {
    setState(prev => ({ ...prev, detailsLoading: true }));
    
    try {
      const detailsData = await requestsApi.fetchRequestDetails(requestSection, id);
      
      // For orders, try to fetch additional user and product data
      if (requestSection === "orders") {
        setState(prev => ({ ...prev, detailsProduct: null, detailsProductName: "" }));
        
        // Try to fetch user data if not included
        if (!detailsData?.user) {
          const userId = detailsData?.user_id || detailsData?.order?.user_id;
          if (userId) {
            const user = await requestsApi.fetchUser(String(userId));
            if (user) {
              detailsData.user = user;
            }
          }
          
          // If still no user, try search by email
          if (!detailsData?.user) {
            const emailCandidate = detailsData?.customer_email || detailsData?.email || detailsData?.order?.customer_email || detailsData?.order?.email;
            if (emailCandidate) {
              const user = await requestsApi.searchUserByEmail(String(emailCandidate));
              if (user) {
                detailsData.user = user;
              }
            }
          }
        }
        
        // Try to fetch product data if there's a product_id
        const productId = detailsData?.product_id || detailsData?.order?.product_id;
        if (productId) {
          const product = await requestsApi.fetchProduct(String(productId));
          if (product) {
            setState(prev => ({ ...prev, detailsProduct: product }));
            const productName = product?.product_name || product?.name || product?.title || product?.title_en || product?.name_en || product?.product_title;
            if (productName) {
              setState(prev => ({ ...prev, detailsProductName: String(productName) }));
            }
          }
        }
      }
      
      setState(prev => ({ ...prev, detailsData, detailsLoading: false }));
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "Failed to load request details");
      setState(prev => ({ ...prev, detailsLoading: false }));
    }
  }, []);

  // Handle single action (approve, cancel, delete)
  const handleAction = useCallback(async (
    type: "approve" | "cancel" | "delete",
    id: string,
    requestSection: RequestSection
  ) => {
    setState(prev => ({ ...prev, actionLoading: id + type }));
    
    try {
      await requestsApi.performAction(requestSection, type, id);

      // Update local state based on action type (handle multiple possible payload shapes)
      setState(prev => {
        const desiredStatus = type === "approve" ? "approved" : "cancelled";

        const updateItem = (item: any) => {
          const itemId = item?.id || item?.request_id || item?.order_id;
          if (String(itemId) !== String(id)) return item;
          const updated = { ...item };
          // Set all common status fields on the item
          updated.status = desiredStatus;
          if ("request_status" in updated) updated.request_status = desiredStatus;
          if ("order_status" in updated) updated.order_status = desiredStatus;
          // Update nested objects if present
          if (updated.order) {
            updated.order = {
              ...updated.order,
              status: desiredStatus,
              order_status: desiredStatus,
            };
          }
          if (updated.request) {
            updated.request = {
              ...updated.request,
              status: desiredStatus,
              request_status: desiredStatus,
            };
          }
          return updated;
        };

        // Helper to update a list by action
        const updateList = (list: any[]) => (
          type === "delete"
            ? list.filter((it: any) => String(it?.id || it?.request_id || it?.order_id) !== String(id))
            : list.map(updateItem)
        );

        // Deep-update common container shapes
        const current = prev.data;
        let nextData: any = current;

        if (Array.isArray(current)) {
          nextData = updateList(current);
        } else if (current && typeof current === 'object') {
          nextData = { ...current };

          // shape: { data: [...] }
          if (Array.isArray(current.data)) {
            nextData.data = updateList(current.data);
          }
          // shape: { data: { data: [...] } }
          if (current.data && Array.isArray(current.data.data)) {
            nextData.data = { ...current.data, data: updateList(current.data.data) };
          }
          // shape: { requests: [...] }
          if (Array.isArray(current.requests)) {
            nextData.requests = updateList(current.requests);
          }
          // shape: { requests: { data: [...] } }
          if (current.requests && Array.isArray(current.requests.data)) {
            nextData.requests = { ...current.requests, data: updateList(current.requests.data) };
          }
          // shape: { orders: [...] }
          if (Array.isArray(current.orders)) {
            nextData.orders = updateList(current.orders);
          }
          // shape: { orders: { data: [...] } }
          if (current.orders && Array.isArray(current.orders.data)) {
            nextData.orders = { ...current.orders, data: updateList(current.orders.data) };
          }
        }

        const nextOverrides = { ...prev.localStatusOverrides } as Record<string, string>;
        if (type === "delete") {
          delete nextOverrides[String(id)];
        } else {
          nextOverrides[String(id)] = desiredStatus;
        }

        return {
          ...prev,
          data: nextData,
          localStatusOverrides: nextOverrides,
        };
      });

      const actionMessages = {
        approve: "Request approved successfully!",
        cancel: "Request cancelled successfully!",
        delete: "Request deleted successfully!",
      };
      showSuccessToast(actionMessages[type]);
      
      // Refresh data after action with a delay to allow server processing
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network or server error. Please check your backend and try again.";
      showErrorToast(errorMessage);
    } finally {
      setState(prev => ({ ...prev, actionLoading: null, confirm: null }));
    }
  }, [fetchData]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: BulkAction, requestSection: RequestSection) => {
    setState(prev => ({ ...prev, actionLoading: 'bulk' }));
    
    try {
      const promises = action.ids.map(id => requestsApi.performAction(requestSection, action.type, id));
      await Promise.all(promises);
      
      setState(prev => ({ ...prev, selectedItems: [], bulkAction: null }));
      showSuccessToast(`${action.type}ed ${action.ids.length} items successfully!`);
      
      // Refresh data after bulk action with a delay
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      showErrorToast(`Failed to ${action.type} items. Please try again.`);
    } finally {
      setState(prev => ({ ...prev, actionLoading: null }));
    }
  }, [fetchData]);

  // Refresh data
  const refreshData = useCallback(async (requestSection: RequestSection) => {
    await fetchData();
  }, [fetchData]);

  // Action functions
  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => {
    setState(prev => ({ 
      ...prev, 
      filters: typeof filters === 'function' ? filters(prev.filters) : filters 
    }));
  }, []);

  const setSelectedItems = useCallback((items: string[] | ((prev: string[]) => string[])) => {
    setState(prev => ({ 
      ...prev, 
      selectedItems: typeof items === 'function' ? items(prev.selectedItems) : items 
    }));
  }, []);

  const setConfirm = useCallback((confirm: ConfirmAction | null) => {
    setState(prev => ({ ...prev, confirm }));
  }, []);

  const setBulkAction = useCallback((bulkAction: BulkAction | null) => {
    setState(prev => ({ ...prev, bulkAction }));
  }, []);

  const setDetailsItem = useCallback((detailsItem: RequestItem | null) => {
    setState(prev => ({ ...prev, detailsItem }));
  }, []);

  return {
    ...state,
    items,
    filtered,
    totalPages,
    paginated,
    statusCounts,
    debouncedQuery,
    setData,
    setPage,
    setFilters,
    setSelectedItems,
    setConfirm,
    setBulkAction,
    setDetailsItem,
    fetchDetails,
    handleAction,
    handleBulkAction,
    refreshData,
  };
}
