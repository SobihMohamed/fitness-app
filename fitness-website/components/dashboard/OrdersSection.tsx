"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Eye } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton, CardSkeleton } from "./LoadingSkeleton";

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface OrdersSectionProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewDetails: (orderId: string) => void;
}

export function OrdersSection({ orders, isLoading, onRefresh, onViewDetails }: OrdersSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order) => 
    searchQuery ? String(order.id).toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const headerActions = (
    <Input
      placeholder="Search by Order ID..."
      className="h-8 w-44 sm:w-56"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );

  return (
    <SectionCard
      title="My Orders"
      icon={ShoppingBag}
      iconColor="text-blue-600"
      count={orders.length}
      isLoading={isLoading}
      onRefresh={onRefresh}
      headerActions={headerActions}
    >
      {isLoading ? (
        <CardSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="You haven't placed any orders yet"
          actionText="Browse products"
          actionHref="/products"
        />
      ) : (
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">Order #{order.id}</span>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        {order.status || "-"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{formatDate(order.created_at)}</p>
                    <p className="text-sm text-gray-800 mb-2">
                      Total: <span className="font-semibold text-lg">${Number(order.total_price || 0).toFixed(2)}</span>
                    </p>
                    {Array.isArray(order.products) && order.products.length > 0 && (
                      <div className="text-sm text-gray-700">
                        <span className="text-gray-600 font-medium">Items:</span>{" "}
                        {order.products.slice(0, 3).map((p) => p.name).join(", ")}
                        {order.products.length > 3 ? "..." : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onViewDetails(String(order.id))}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" /> 
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </SectionCard>
  );
}
