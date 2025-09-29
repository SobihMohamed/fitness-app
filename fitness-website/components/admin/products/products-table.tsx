"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProxyImageUrl } from "@/lib/images";
import { Plus, Edit3, Trash2, Eye, ImageIcon, Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Category } from "@/types";

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  searchTerm: string;
  selectedCategory: string;
  onPageChange: (page: number) => void;
  onViewDetails: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: () => void;
}

export const ProductsTable = React.memo<ProductsTableProps>(({
  products,
  categories,
  currentPage,
  totalPages,
  itemsPerPage,
  searchTerm,
  selectedCategory,
  onPageChange,
  onViewDetails,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
}) => {
  const handlePrevPage = useCallback(() => {
    onPageChange(Math.max(1, currentPage - 1));
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages, onPageChange]);

  const getCategoryName = useCallback((categoryId: string) => {
    return categories.find(c => c.category_id === categoryId)?.name || "Uncategorized";
  }, [categories]);

  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-white px-6 py-4 border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Products
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Manage your product inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="w-16 font-medium text-slate-600 py-3 px-6">
                  ID
                </TableHead>
                <TableHead className="w-20 font-medium text-slate-600 py-3 px-6">
                  Image
                </TableHead>
                <TableHead className="min-w-[200px] font-medium text-slate-600 py-3 px-6">
                  Product Name
                </TableHead>
                <TableHead className="w-24 font-medium text-slate-600 py-3 px-6">
                  Price
                </TableHead>
                <TableHead className="min-w-[150px] font-medium text-slate-600 py-3 px-6">
                  Category
                </TableHead>
                <TableHead className="w-24 font-medium text-slate-600 py-3 px-6">
                  Stock
                </TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 py-3 px-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.product_id}
                  className="hover:bg-slate-50/70 transition-colors duration-200 border-b border-slate-100"
                >
                  <TableCell className="font-medium text-slate-500 py-4 px-6">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {product.main_image_url ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm border border-slate-200 transition-transform hover:scale-105">
                        <img
                          src={getProxyImageUrl(product.main_image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-800 mb-1 line-clamp-2">
                        {product.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="default"
                      className="bg-indigo-100/80 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-md font-medium"
                    >
                      {product.price} EGP
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700 border-slate-200"
                    >
                      {getCategoryName(product.category_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant={product.is_in_stock === "1" ? "default" : "secondary"}
                      className={
                        product.is_in_stock === "1"
                          ? "bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-md font-medium"
                          : "bg-red-100/80 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded-md font-medium"
                      }
                    >
                      {product.is_in_stock === "1" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(product)}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                      >
                        <Eye className="h-4 w-4 text-indigo-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="h-9 w-9 p-0 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
                      >
                        <Edit3 className="h-4 w-4 text-indigo-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteProduct(product.product_id)}
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

          {/* No results */}
          {products.length === 0 && (
            <div className="text-center py-24 px-6">
              <div className="p-6 bg-slate-100/70 rounded-full w-28 h-28 mx-auto mb-8 flex items-center justify-center shadow-inner">
                <Package className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "No products found"
                  : "No products yet"}
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search criteria to find what you're looking for"
                  : "Get started by adding your first product to the platform"}
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button
                  onClick={onAddProduct}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-6 px-4 border-t border-slate-100 bg-white">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-full border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = currentPage === pageNum;
                const isFirstPage = pageNum === 1;
                const isLastPage = pageNum === totalPages;
                const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;

                if (isFirstPage || isLastPage || isNearCurrent) {
                  return (
                    <Button
                      key={i}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className={`w-9 h-9 rounded-full ${
                        isCurrentPage
                          ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                          : "hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <div key={i} className="px-1">
                      ...
                    </div>
                  );
                }
                return null;
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-full border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ProductsTable.displayName = "ProductsTable";
