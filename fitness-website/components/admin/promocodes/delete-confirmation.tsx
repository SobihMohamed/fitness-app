"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PromoCode } from "@/types";

interface DeleteConfirmationProps {
  promoCode: PromoCode | null;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const DeleteConfirmation = React.memo(({ 
  promoCode, 
  onConfirm, 
  onCancel, 
  submitting 
}: DeleteConfirmationProps) => {
  const isOpen = !!promoCode;

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!submitting && !open) {
      onCancel();
    }
  }, [submitting, onCancel]);

  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Promo Code</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete promo code{" "}
            <span className="font-semibold">{promoCode?.promo_code}</span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

DeleteConfirmation.displayName = "DeleteConfirmation";

export { DeleteConfirmation };
