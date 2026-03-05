import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, Calendar, DollarSign, X } from "lucide-react";
import { getProxyImageUrl } from "@/lib/images";
import { formatDateUTC } from "@/lib/utils/format";
import type { Service } from "@/types";

interface ServiceDetailsProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServiceDetails = ({
  service,
  open,
  onOpenChange,
}: ServiceDetailsProps) => {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Service Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive overview of the service information used in the
            system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Main Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100">
            <Image
              src={
                getProxyImageUrl(service.picture || undefined) ||
                "/placeholder.svg"
              }
              alt={service.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-w: 768px) 100vw, 600px"
              priority
            />
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                {service.title}
              </h3>
              <Badge
                variant="secondary"
                className="text-lg font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1"
              >
                {service.price} EGP
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{service.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Created{" "}
                  {service.created_at
                    ? formatDateUTC(service.created_at)
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-[200px] overflow-y-auto">
              <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">
                Description
              </h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap break-all">
                {service.details || "No details provided."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex w-full justify-between items-center text-xs text-slate-400">
            <span>ID: {service.service_id}</span>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
