"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromoCodeManagement } from "@/hooks/admin/use-promocode-management";
import { Ticket } from "lucide-react";

// Dynamic imports for heavy components with SSR disabled to prevent hydration mismatches
const StatsCards = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.StatsCards })), { ssr: false });
const SearchAndFilter = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.SearchAndFilter })), { ssr: false });
const PromoCodeTable = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.PromoCodeTable })), { ssr: false });
const PromoCodeForm = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.PromoCodeForm })), { ssr: false });
const DeleteConfirmation = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.DeleteConfirmation })), { ssr: false });
const ActionButtons = dynamic(() => import("@/components/admin/promocodes").then(mod => ({ default: mod.ActionButtons })), { ssr: false });

const PromoCodesManagement = React.memo(() => {
  const {
    // State
    promoCodes,
    loading,
    submitting,
    search,
    isDialogOpen,
    editing,
    confirmDelete,
    form,
    
    // Computed values
    filteredPromoCodes,
    
    // Actions
    openAdd,
    openEdit,
    savePromoCode,
    deletePromoCode,
    setSearch,
    setIsDialogOpen,
    setConfirmDelete,
    isActive,
    updateForm,
  } = usePromoCodeManagement();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-3 bg-indigo-100 rounded-xl">
              <Ticket className="h-7 w-7 text-indigo-700" />
            </span>
            Promo Codes
          </h1>
          <p className="text-slate-600 mt-4 text-lg">
            Create and manage discount codes for your store and services.
          </p>
        </div>
        <ActionButtons onAddClick={openAdd} />
      </div>

      {/* Stats Cards */}
      <StatsCards promoCodes={promoCodes} loading={loading} />

      {/* Main Content Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-slate-800">All Promo Codes</CardTitle>
            <SearchAndFilter
              search={search}
              onSearchChange={setSearch}
              placeholder="Search promo codes or percentage..."
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <PromoCodeTable
            promoCodes={filteredPromoCodes}
            loading={loading}
            onEdit={openEdit}
            onDelete={setConfirmDelete}
            isActive={isActive}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PromoCodeForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editing={editing}
        form={form}
        onFormChange={updateForm}
        onSave={savePromoCode}
        submitting={submitting}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        promoCode={confirmDelete}
        onConfirm={deletePromoCode}
        onCancel={() => setConfirmDelete(null)}
        submitting={submitting}
      />
    </div>
  );
});

PromoCodesManagement.displayName = "PromoCodesManagement";

export default function AdminPromoCodesPage() {
  return (
    <AdminLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
        <PromoCodesManagement />
      </div>
    </AdminLayout>
  );
}
