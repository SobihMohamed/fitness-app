"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  BookOpen, 
  DollarSign 
} from "lucide-react";
import { formatDateUTC } from "@/utils/format";
import type { RequestItem, RequestSection, RequestDetailsData } from "@/types";

interface RequestsDetailsDialogProps {
  section: RequestSection;
  detailsItem: RequestItem | null;
  detailsData: RequestDetailsData | null;
  detailsLoading: boolean;
  detailsProduct: any;
  detailsProductName: string;
  onClose: () => void;
}

// Helper components
const DetailItem = React.memo<{ label: string; value: any }>(({ label, value }) => (
  <div className="space-y-2">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="font-medium">{value || "-"}</div>
  </div>
));

DetailItem.displayName = "DetailItem";

const TextDetailItem = React.memo<{ label: string; value: any }>(({ label, value }) => (
  <div className="space-y-2">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      {value || `No ${label.toLowerCase()} provided`}
    </div>
  </div>
));

TextDetailItem.displayName = "TextDetailItem";

const DetailsUserName = React.memo<{
  userId?: string | number;
  email?: string;
}>(({ userId, email }) => {
  if (userId != null && userId !== "") {
    return <span>{String(userId)}</span>;
  }
  if (email) {
    return <span>{email}</span>;
  }
  return <span className="text-slate-500">N/A</span>;
});

DetailsUserName.displayName = "DetailsUserName";

export const RequestsDetailsDialog = React.memo<RequestsDetailsDialogProps>(({
  section,
  detailsItem,
  detailsData,
  detailsLoading,
  detailsProduct,
  detailsProductName,
  onClose
}) => {
  // Memoized currency formatter
  const formatCurrency = useMemo(() => (v: any) => {
    const num = Number(v);
    if (isNaN(num)) return "-";
    return `${num.toFixed(2)} EGP`;
  }, []);

  // Memoized product name computation (as a callable function)
  const computeProductName = useMemo(() => {
    return () => {
      const nameFromItems = detailsData?.order_items?.[0]?.product_name;
      const nameFromOrder =
        detailsData?.product_name ||
        detailsData?.product_title ||
        detailsData?.order?.product_name ||
        detailsData?.order?.product_title;
      const nameFromProduct =
        detailsProductName ||
        detailsProduct?.product_name ||
        detailsProduct?.name ||
        detailsProduct?.title ||
        detailsProduct?.title_en ||
        detailsProduct?.name_en ||
        detailsProduct?.product_title;
      const pid = detailsData?.product_id || detailsData?.order?.product_id || detailsProduct?.id;
      return nameFromItems || nameFromOrder || nameFromProduct || (pid ? `Product #${pid}` : "-");
    };
  }, [detailsData, detailsProduct, detailsProductName]);

  return (
    <Dialog open={!!detailsItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-200 mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              {section === "training" ? (
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              ) : section === "courses" ? (
                <BookOpen className="h-6 w-6 text-indigo-600" />
              ) : (
                <DollarSign className="h-6 w-6 text-indigo-600" />
              )}
            </div>
            <span className="bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              {section === "training"
                ? "Training"
                : section === "courses"
                ? "Course"
                : "Order"}{" "}
              Request Details
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-2 text-base">
            Detailed information about this {section} request
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {detailsLoading ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
              </div>
              <p className="text-slate-600 font-medium">
                Loading request details...
              </p>
              <p className="text-slate-400 text-sm">
                This may take a moment
              </p>
            </div>
          </div>
        ) : detailsData ? (
          <div className="grid gap-6 py-4 px-2">
            {/* Training Details */}
            {section === "training" && (
              <>
                <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-lg">Visitor Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem
                      label="Name"
                      value={detailsData.name || detailsData.user_name}
                    />
                    <DetailItem label="Age" value={detailsData.age} />
                    <DetailItem
                      label="Email"
                      value={detailsData.email || detailsData.user_email}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-lg">Training Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem
                      label="Start Date"
                      value={
                        detailsData.start_date
                          ? formatDateUTC(detailsData.start_date)
                          : null
                      }
                    />
                    <DetailItem
                      label="End Date"
                      value={
                        detailsData.end_date
                          ? formatDateUTC(detailsData.end_date)
                          : null
                      }
                    />
                    <DetailItem
                      label="Training Per Week"
                      value={detailsData.training_per_week}
                    />
                    <DetailItem
                      label="Training Place"
                      value={detailsData.training_place}
                    />
                    <DetailItem label="Weight" value={detailsData.weight} />
                    <DetailItem label="Height" value={detailsData.height} />
                    <div className="space-y-2 col-span-2">
                      <div className="text-sm text-slate-500">Status</div>
                      <div>
                        <Badge
                          className={`${
                            detailsData.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : detailsData.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {detailsData.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-lg">Health Information</span>
                  </h3>
                  <div className="space-y-4">
                    <TextDetailItem
                      label="Injury Details"
                      value={detailsData.injury_details}
                    />
                    <TextDetailItem
                      label="Diseases Details"
                      value={detailsData.diseases_details}
                    />
                    <TextDetailItem
                      label="Goal Description"
                      value={detailsData.goal_description}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Course Details */}
            {section === "courses" && (
              <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-lg">Visitor Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <DetailItem
                    label="Name"
                    value={
                      detailsData.user?.name ||
                      detailsData.user_name ||
                      detailsData.student_name ||
                      detailsData.name
                    }
                  />
                  <DetailItem
                    label="Email"
                    value={
                      detailsData.user?.email ||
                      detailsData.user_email ||
                      detailsData.email
                    }
                  />
                </div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-lg">Course Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    label="Course Name"
                    value={
                      detailsData.course_title ||
                      detailsData.course_name ||
                      detailsData.title ||
                      detailsData.title_en ||
                      detailsData.courseTitle ||
                      detailsData.course_name_en ||
                      detailsData.courseName ||
                      detailsData.course?.course_title ||
                      detailsData.course?.title ||
                      detailsData.course?.title_en ||
                      detailsData.course?.name ||
                      detailsData.course?.name_en ||
                      detailsData.request?.course_title ||
                      detailsData.request?.course_name ||
                      detailsData.request?.title ||
                      detailsData.request?.courseTitle
                    }
                  />
                  <DetailItem
                    label="Course Price"
                    value={(() => {
                      const price =
                        detailsData.course_price ??
                        detailsData.course?.price ??
                        detailsData.price ??
                        detailsData.request?.course_price;
                      return price != null && price !== '' ? `${price} EGP` : '-';
                    })()}
                  />
                  <DetailItem
                    label="Created At"
                    value={(() => {
                      const dt =
                        detailsData.created_at ||
                        detailsData.createdAt ||
                        detailsData.request_date ||
                        detailsData.date;
                      return dt ? formatDateUTC(dt) : null;
                    })()}
                  />
                  <DetailItem
                    label="Student Name"
                    value={
                      detailsData.student_name ||
                      detailsData.user?.name ||
                      detailsData.user_name ||
                      detailsData.trainee_name ||
                      detailsData.customer_name ||
                      detailsData.name
                    }
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-slate-500">Status</div>
                    <Badge
                      className={`${
                        detailsData.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : detailsData.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {detailsData.status || "pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            {section === "orders" && (
              <div className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-lg">Order Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    label="User Name"
                    value={
                      detailsData.user?.name ||
                      detailsData.customer_name ||
                      detailsData.order?.customer_name ||
                      detailsData.customer_full_name ||
                      detailsData.customer?.full_name ||
                      detailsData.customer?.name ||
                      detailsData.user_name ||
                      detailsData.billing_name ||
                      detailsData.shipping_name ||
                      detailsData.student_name ||
                      detailsData.trainee_name || (
                        <DetailsUserName
                          userId={
                            detailsData.user_id ||
                            detailsData.user?.user_id ||
                            detailsData.order?.user_id ||
                            detailsData.customer_id ||
                            detailsData.customer?.id ||
                            detailsData.order?.customer_id
                          }
                          email={
                            detailsData.customer_email ||
                            detailsData.order?.customer_email ||
                            detailsData.user?.email ||
                            detailsData.order?.email ||
                            detailsData.email
                          }
                        />
                      )
                    }
                  />
                  <DetailItem
                    label="Customer Email"
                    value={
                      detailsData.customer_email ||
                      detailsData.order?.customer_email ||
                      detailsData.user?.email ||
                      detailsData.order?.email ||
                      detailsData.email
                    }
                  />
                  <DetailItem
                    label="Total Price"
                    value={(() => {
                      const total =
                        detailsData.total_price ??
                        detailsData.total ??
                        detailsData.amount ??
                        detailsData.order_total ??
                        detailsData.price ??
                        detailsData.order?.total;
                      return total != null && total !== '' ? `${total} EGP` : '-';
                    })()}
                  />
                  <DetailItem
                    label="Created At"
                    value={(() => {
                      const dt =
                        detailsData.created_at ||
                        detailsData.createdAt ||
                        detailsData.purchase_date ||
                        detailsData.order_date ||
                        detailsData.date ||
                        detailsData.created ||
                        detailsData.created_on ||
                        detailsData.createdOn ||
                        detailsData.orderDate ||
                        detailsData.placed_at ||
                        detailsData.placedAt ||
                        detailsData.order?.created_at ||
                        detailsData.order?.createdAt ||
                        detailsData.order?.purchase_date;
                      if (!dt) return null;
                      const d = new Date(dt as any);
                      return isNaN(d.getTime()) ? String(dt).slice(0, 10) : formatDateUTC(dt as any);
                    })()}
                  />
                  <div className="space-y-2">
                    <div className="text-sm text-slate-500">Status</div>
                    <Badge
                      className={`capitalize ${
                        detailsData.status === 'approved'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : detailsData.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {detailsData.status || 'pending'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 text-base mb-2">
                    Order Items
                  </h4>
                  <ul className="space-y-2">
                    {detailsData.order_items?.length > 0 ? (
                      detailsData.order_items.map(
                        (item: any, idx: number) => (
                          <li key={idx} className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{item.product_name}</span>
                              <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                              <span>
                                <span className="text-slate-500">Unit Price: </span>
                                <span className="font-medium">{formatCurrency(item.price)}</span>
                              </span>
                              <span>
                                <span className="text-slate-500">Discount: </span>
                                <span className="font-medium">{(() => { const d = Number(detailsData.discount_value ?? detailsData.order?.discount_value); return isNaN(d) ? '-' : `${d.toFixed(2)}%`; })()}</span>
                              </span>
                              <span>
                                <span className="text-slate-500">Line Total: </span>
                                <span className="font-medium">{formatCurrency(Number(item.price) * Number(item.quantity))}</span>
                              </span>
                            </div>
                          </li>
                        )
                      )
                    ) : detailsProduct ? (
                          <li className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800">{computeProductName()}</span>
                              <span className="text-sm text-slate-500">{(() => { const q = Number(detailsData.quantity || detailsData.order?.quantity || 1); return `Qty: ${q}`; })()}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                              <span>
                                <span className="text-slate-500">Unit Price: </span>
                                <span className="font-medium">{(() => { const up = Number(detailsProduct?.price || detailsProduct?.unit_price || detailsProduct?.price_value || NaN); return isNaN(up) ? '-' : formatCurrency(up); })()}</span>
                              </span>
                              <span>
                                <span className="text-slate-500">Discount: </span>
                                <span className="font-medium">{(() => { const d = Number(detailsData.discount_value ?? detailsData.order?.discount_value); return isNaN(d) ? '-' : `${d.toFixed(2)}%`; })()}</span>
                              </span>
                              <span>
                                <span className="text-slate-500">Line Total: </span>
                                <span className="font-medium">{(() => { const q = Number(detailsData.quantity || detailsData.order?.quantity || 1); const up = Number(detailsProduct?.price || detailsProduct?.unit_price || detailsProduct?.price_value || NaN); return isNaN(up) ? '-' : formatCurrency(q * up); })()}</span>
                              </span>
                            </div>
                          </li>
                    ) : (
                      <li className="text-sm text-slate-500">
                        No items found.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-slate-400" />
            <p className="font-medium text-slate-700 mb-1">
              No details available
            </p>
            <p>The request details could not be loaded</p>
          </div>
        )}
        <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
          <DialogClose asChild>
            <button className="px-6 py-2 bg-transparent border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors">
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
});

RequestsDetailsDialog.displayName = "RequestsDetailsDialog";
