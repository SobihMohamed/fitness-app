"use client";

import React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-2">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
      {description && (
        <p className="text-slate-600 mt-1">{description}</p>
      )}
    </div>
  );
}


