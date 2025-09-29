"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Plus } from "lucide-react";
import { getProxyImageUrl } from "@/lib/images";
import { formatDateUTC } from "@/utils/format";
import type { Service } from "@/types";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onCreate: () => void;
  isDeleting: boolean;
  searchTerm: string;
}

export const ServiceTable = React.memo<ServiceTableProps>(({ 
  services, 
  onEdit, 
  onDelete, 
  onCreate,
  isDeleting,
  searchTerm
}) => {
  const handleEdit = useCallback((service: Service) => {
    onEdit(service);
  }, [onEdit]);

  const handleDelete = useCallback((serviceId: string) => {
    onDelete(serviceId);
  }, [onDelete]);

  const handleCreate = useCallback(() => {
    onCreate();
  }, [onCreate]);

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-20 font-semibold text-slate-700">Image</TableHead>
                <TableHead className="min-w-[200px] font-semibold text-slate-700">Title</TableHead>
                <TableHead className="w-28 font-semibold text-slate-700">Price</TableHead>
                <TableHead className="w-40 font-semibold text-slate-700">Duration</TableHead>
                <TableHead className="w-40 font-semibold text-slate-700">Created</TableHead>
                <TableHead className="w-40 text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow 
                  key={service.service_id} 
                  className="hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100"
                >
                  <TableCell>
                    <div className="h-14 w-14 overflow-hidden rounded-lg border bg-slate-100 shadow-sm relative">
                      <Image
                        alt={service.title}
                        src={getProxyImageUrl(service.picture || undefined) || "/placeholder.svg"}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{service.title}</TableCell>
                  <TableCell className="text-slate-700">{service.price} EGP</TableCell>
                  <TableCell className="text-slate-700">{service.duration}</TableCell>
                  <TableCell className="text-slate-700">
                    {service.created_at ? formatDateUTC(service.created_at) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                      >
                        <Edit3 className="h-4 w-4 text-indigo-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.service_id)}
                        disabled={isDeleting}
                        className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {services.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm ? "No services found" : "No services yet"}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search criteria to find what you're looking for"
                  : "Get started by adding your first service to the platform"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleCreate} 
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Service
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ServiceTable.displayName = "ServiceTable";
