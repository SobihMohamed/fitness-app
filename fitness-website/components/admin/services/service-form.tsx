"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Wrench, X } from "lucide-react";
import type { Service, ServiceFormData } from "@/types";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: Service | null;
  onSubmit: (formData: ServiceFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const ServiceForm = React.memo<ServiceFormProps>(
  ({ open, onOpenChange, editingService, onSubmit, isSubmitting }) => {
    const TITLE_MIN = 3;
    const TITLE_MAX = 50;
    const PRICE_MIN_LEN = 1;
    const PRICE_MAX_LEN = 10;
    const DURATION_MIN = 2;
    const DURATION_MAX = 50;
    const DETAILS_MAX = 1000;

    const [formData, setFormData] = useState<ServiceFormData>({
      title: "",
      details: "",
      duration: "",
      price: "",
      picture: null,
    });
    const [titleError, setTitleError] = useState<string>("");
    const [priceError, setPriceError] = useState<string>("");
    const [durationError, setDurationError] = useState<string>("");
    const [detailsError, setDetailsError] = useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Reset form when dialog opens/closes or editing service changes
    React.useEffect(() => {
      if (open) {
        if (editingService) {
          setFormData({
            title: editingService.title || "",
            details: editingService.details || "",
            duration: editingService.duration || "",
            price: String(editingService.price ?? ""),
            picture: null,
          });
        } else {
          setFormData({
            title: "",
            details: "",
            duration: "",
            price: "",
            picture: null,
          });
        }
        setTitleError("");
        setPriceError("");
        setDurationError("");
        setDetailsError("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }, [open, editingService]);

    const validateTitle = useCallback((value: string) => {
      const trimmed = value.trim();
      if (!trimmed.length) return "Title is required";
      if (trimmed.length < TITLE_MIN) return `Minimum ${TITLE_MIN} characters`;
      if (trimmed.length > TITLE_MAX) return "Invalid service title";
      return "";
    }, []);

    const validateDuration = useCallback((value: string) => {
      const trimmed = value.trim();
      if (!trimmed.length) return "Duration is required";
      if (trimmed.length < DURATION_MIN)
        return `Minimum ${DURATION_MIN} characters`;
      if (trimmed.length > DURATION_MAX)
        return `Maximum ${DURATION_MAX} characters`;
      return "";
    }, []);

    const validatePrice = useCallback((value: string) => {
      const trimmed = value.trim();
      if (!trimmed.length) return "Price is required";
      if (!/^\d+(\.\d{0,2})?$/.test(trimmed))
        return "Numbers only (up to 2 decimals)";
      if (trimmed.replace(/\D/g, "").length < PRICE_MIN_LEN)
        return `Minimum ${PRICE_MIN_LEN} digit`;
      if (trimmed.replace(/\D/g, "").length > PRICE_MAX_LEN)
        return `Maximum ${PRICE_MAX_LEN} digits`;
      return "";
    }, []);

    const validateDetails = useCallback((value: string) => {
      const trimmed = value.trim();
      if (!trimmed.length) return "Details are required";
      if (trimmed.length > DETAILS_MAX)
        return `Maximum ${DETAILS_MAX} characters`;
      return "";
    }, []);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        const titleValidation = validateTitle(formData.title);
        if (titleValidation) {
          setTitleError(titleValidation);
          return;
        }
        const priceValidation = validatePrice(String(formData.price));
        if (priceValidation) {
          setPriceError(priceValidation);
          return;
        }
        const durationValidation = validateDuration(formData.duration);
        if (durationValidation) {
          setDurationError(durationValidation);
          return;
        }
        const detailsValidation = validateDetails(formData.details);
        if (detailsValidation) {
          setDetailsError(detailsValidation);
          return;
        }

        try {
          await onSubmit(formData);
          onOpenChange(false);
        } catch (error) {
          // Error handling is done in the parent component
        }
      },
      [
        formData,
        onSubmit,
        onOpenChange,
        validateDuration,
        validatePrice,
        validateTitle,
        validateDetails,
      ],
    );

    const handleInputChange = useCallback(
      (field: keyof ServiceFormData, value: string | File | null) => {
        if (field === "price" && typeof value === "string") {
          // Strip non-numeric except a single decimal point; cap to 2 decimal places
          let sanitized = value.replace(/[^0-9.]/g, "");
          const parts = sanitized.split(".");
          if (parts.length > 2) {
            sanitized = parts[0] + "." + parts.slice(1).join("");
          }
          const [intPart, decimalPart] = sanitized.split(".");
          sanitized = intPart || "";
          if (decimalPart !== undefined) {
            sanitized += "." + decimalPart.slice(0, 2);
          }
          setFormData((prev) => ({ ...prev, price: sanitized }));
          setPriceError(validatePrice(sanitized));
          return;
        }

        if (field === "duration" && typeof value === "string") {
          setFormData((prev) => ({ ...prev, duration: value }));
          setDurationError(validateDuration(value));
          return;
        }

        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "title" && typeof value === "string") {
          setTitleError(validateTitle(value));
        }
        if (field === "details" && typeof value === "string") {
          setDetailsError(validateDetails(value));
        }
      },
      [validateDuration, validatePrice, validateTitle, validateDetails],
    );

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleInputChange("picture", file);
      },
      [handleInputChange],
    );

    const handleRemoveFile = useCallback(() => {
      handleInputChange("picture", null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, [handleInputChange]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Wrench className="h-5 w-5 text-indigo-600" />
              </div>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {editingService
                ? "Update the service information below."
                : "Fill in the details to add a new service to your platform."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Title *
                </label>
                <Input
                  placeholder="e.g. Personal Training"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  minLength={TITLE_MIN}
                  maxLength={TITLE_MAX}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {titleError ? (
                  <p className="text-sm text-red-600">{titleError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Min {TITLE_MIN} / Max {TITLE_MAX} characters
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Price *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 99"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                  inputMode="decimal"
                  aria-invalid={!!priceError}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {priceError ? (
                  <p className="text-sm text-red-600">{priceError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Numbers only, up to {PRICE_MAX_LEN} digits (2 decimals)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Duration *
                </label>
                <Input
                  placeholder="e.g. 60 minutes"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  required
                  aria-invalid={!!durationError}
                  minLength={DURATION_MIN}
                  maxLength={DURATION_MAX}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {durationError ? (
                  <p className="text-sm text-red-600">{durationError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Minimum length is {DURATION_MIN} characters. Maximum length
                    is {DURATION_MAX} characters.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Image
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {formData.picture && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-11 w-11 shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Details *
              </label>
              <Textarea
                rows={4}
                value={formData.details}
                onChange={(e) => handleInputChange("details", e.target.value)}
                placeholder="Describe the service..."
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                maxLength={DETAILS_MAX}
                aria-invalid={!!detailsError}
              />
              {detailsError ? (
                <p className="text-sm text-red-600">{detailsError}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Maximum length: {DETAILS_MAX} characters.
                </p>
              )}
            </div>

            <DialogFooter className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !!titleError ||
                  !!priceError ||
                  !!durationError ||
                  !!detailsError ||
                  !formData.title.trim() ||
                  !formData.duration.trim() ||
                  !formData.price.trim() ||
                  !formData.details.trim()
                }
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingService ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingService ? "Save Changes" : "Create Service"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

ServiceForm.displayName = "ServiceForm";
