"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PromoCode, PromoCodeFormData } from "@/types";

interface PromoCodeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PromoCode | null;
  form: PromoCodeFormData;
  onFormChange: (field: keyof PromoCodeFormData, value: string) => void;
  onSave: () => void;
  submitting: boolean;
}

const PromoCodeForm = React.memo(({ 
  isOpen, 
  onOpenChange, 
  editing, 
  form, 
  onFormChange, 
  onSave, 
  submitting 
}: PromoCodeFormProps) => {
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!submitting) {
      onOpenChange(open);
    }
  }, [submitting, onOpenChange]);

  const handleSave = React.useCallback(() => {
    onSave();
  }, [onSave]);

  const handleFormChange = React.useCallback((field: keyof PromoCodeFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      onFormChange(field, e.target.value);
    };
  }, [onFormChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Promo Code" : "New Promo Code"}
          </DialogTitle>
          <DialogDescription>
            Configure the promo code, date range, and discount percentage.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Promo Code
            </label>
            <Input
              value={form.promo_code}
              onChange={handleFormChange('promo_code')}
              placeholder="e.g. DISCOUNT10"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Start Date
            </label>
            <Input
              type="date"
              value={form.start_date}
              onChange={handleFormChange('start_date')}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              End Date
            </label>
            <Input
              type="date"
              value={form.end_date}
              onChange={handleFormChange('end_date')}
              disabled={submitting}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Percentage of Discount
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={100}
                step={1}
                value={form.percentage_of_discount}
                onChange={handleFormChange('percentage_of_discount')}
                placeholder="10"
                disabled={submitting}
              />
              <span className="text-slate-500">%</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {submitting
              ? "Saving..."
              : editing
              ? "Save Changes"
              : "Create Promo Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

PromoCodeForm.displayName = "PromoCodeForm";

export { PromoCodeForm };
