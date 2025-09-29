"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useServiceManagement } from "@/hooks/admin/use-service-management";
import type { Service, ServiceFormData, ServiceDeleteTarget } from "@/types";

// Dynamic imports with SSR disabled to prevent hydration mismatches
const StatsCards = dynamic(() => import("@/components/admin/services").then(mod => ({ default: mod.StatsCards })), { ssr: false });
const SearchAndFilter = dynamic(() => import("@/components/admin/services").then(mod => ({ default: mod.SearchAndFilter })), { ssr: false });
const ServiceTable = dynamic(() => import("@/components/admin/services").then(mod => ({ default: mod.ServiceTable })), { ssr: false });
const ServiceForm = dynamic(() => import("@/components/admin/services").then(mod => ({ default: mod.ServiceForm })), { ssr: false });
const DeleteConfirmation = dynamic(() => import("@/components/admin/services").then(mod => ({ default: mod.DeleteConfirmation })), { ssr: false });

const AdminServicesPage = React.memo(() => {
  // Hook for service management
  const {
    services,
    loading,
    searchTerm,
    debouncedSearchTerm,
    filteredServices,
    stats,
    setSearchTerm,
    addService,
    updateService,
    deleteService,
  } = useServiceManagement();

  // Local state for UI
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceDeleteTarget | null>(null);

  // Handlers with useCallback for performance
  const handleCreate = useCallback(() => {
    setEditingService(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((service: Service) => {
    setEditingService(service);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((serviceId: string) => {
    const service = services.find(s => s.service_id === serviceId);
    const name = service?.title || "this service";
    setDeleteTarget({ id: serviceId, name });
    setShowDeleteConfirm(true);
  }, [services]);

  const handleFormSubmit = useCallback(async (formData: ServiceFormData) => {
    if (editingService) {
      await updateService(editingService.service_id, formData);
    } else {
      await addService(formData);
    }
  }, [editingService, addService, updateService]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteService(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteService]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, [setSearchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Wrench className="h-8 w-8 text-indigo-600" />
              </div>
              Services Management
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Create, edit, and manage your offered services
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Services Table */}
        <ServiceTable
          services={filteredServices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          isDeleting={loading.deleting}
          searchTerm={debouncedSearchTerm}
        />

        {/* Service Form Modal */}
        <ServiceForm
          open={showForm}
          onOpenChange={setShowForm}
          editingService={editingService}
          onSubmit={handleFormSubmit}
          isSubmitting={loading.submitting}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          deleteTarget={deleteTarget}
          onConfirm={handleDeleteConfirm}
          isDeleting={loading.deleting}
        />
      </div>
      {/* Floating action to add Service */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleCreate}
          className="px-4 py-3 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          aria-label="Add Service"
        >
          + New Service
        </button>
      </div>
    </AdminLayout>
  );
});

AdminServicesPage.displayName = "AdminServicesPage";

export default AdminServicesPage;
