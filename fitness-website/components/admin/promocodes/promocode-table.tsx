"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Trash2, Percent, CalendarDays } from "lucide-react";
import type { PromoCode } from "@/types";

interface PromoCodeTableProps {
  promoCodes: PromoCode[];
  loading?: boolean;
  onEdit: (promoCode: PromoCode) => void;
  onDelete: (promoCode: PromoCode) => void;
  isActive: (promoCode: PromoCode) => boolean;
}

const PromoCodeTable = React.memo(({ 
  promoCodes, 
  loading, 
  onEdit, 
  onDelete, 
  isActive 
}: PromoCodeTableProps) => {
  const handleEdit = React.useCallback((promoCode: PromoCode) => {
    onEdit(promoCode);
  }, [onEdit]);

  const handleDelete = React.useCallback((promoCode: PromoCode) => {
    onDelete(promoCode);
  }, [onDelete]);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead className="whitespace-nowrap">Discount</TableHead>
              <TableHead className="whitespace-nowrap">Start</TableHead>
              <TableHead className="whitespace-nowrap">End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (promoCodes.length === 0) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead className="whitespace-nowrap">Discount</TableHead>
              <TableHead className="whitespace-nowrap">Start</TableHead>
              <TableHead className="whitespace-nowrap">End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-slate-500"
              >
                No promo codes found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead className="whitespace-nowrap">Discount</TableHead>
            <TableHead className="whitespace-nowrap">Start</TableHead>
            <TableHead className="whitespace-nowrap">End</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.map((promoCode) => (
            <TableRow key={promoCode.promoCode_id}>
              <TableCell className="font-semibold">
                {promoCode.promo_code}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-slate-500" />
                  {promoCode.percentage_of_discount}%
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {promoCode.start_date?.slice(0, 10)}
                </div>
              </TableCell>
              <TableCell>{promoCode.end_date?.slice(0, 10)}</TableCell>
              <TableCell>
                {isActive(promoCode) ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promoCode)}
                    className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                  >
                    <Edit3 className="h-4 w-4 text-indigo-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promoCode)}
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
    </div>
  );
});

PromoCodeTable.displayName = "PromoCodeTable";

export { PromoCodeTable };
