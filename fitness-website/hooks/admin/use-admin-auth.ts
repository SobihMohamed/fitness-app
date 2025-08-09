"use client";

import { useState, useEffect } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return false;
      
      const token = localStorage.getItem("adminAuth");
      const authStatus = !!token;
      
      setIsAuthenticated(authStatus);
      setIsLoading(false);
      return authStatus;
    };

    checkAuth();

    // Listen for admin login/logout events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("admin-logged-in", handleAuthChange);
    window.addEventListener("admin-logged-out", handleAuthChange);

    return () => {
      window.removeEventListener("admin-logged-in", handleAuthChange);
      window.removeEventListener("admin-logged-out", handleAuthChange);
    };
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    isAuthenticated,
    isLoading,
    getAuthHeaders,
  };
}