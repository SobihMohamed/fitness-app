"use client";

import { useState } from "react";

export function useLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  };

  const isLoading = (key: string) => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = () => {
    return Object.values(loadingStates).some(Boolean);
  };

  const withLoading = async (key: string, asyncFn: () => Promise<any>) => {
    setLoading(key, true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(key, false);
    }
  };

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
  };
}
