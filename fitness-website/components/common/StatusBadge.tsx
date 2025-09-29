"use client";

import React from "react";

export interface StatusBadgeProps {
  status?: "pending" | "approved" | "cancelled" | string | null;
  className?: string;
}

const map = {
  pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
  approved: { color: "bg-green-100 text-green-800", text: "Enrolled" },
  cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  if (!status) return null;
  const key = (String(status).toLowerCase() as keyof typeof map);
  const cfg = map[key];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${className}`}>
      {cfg.text}
    </span>
  );
};

export default React.memo(StatusBadge);
