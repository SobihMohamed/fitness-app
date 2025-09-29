"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImagePreviewDialog = React.memo<ImagePreviewDialogProps>(({
  imageUrl,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 bg-black/95 overflow-hidden rounded-xl border-none">
        <VisuallyHidden>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[85vh]">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <DialogFooter className="p-4 bg-black/80 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ImagePreviewDialog.displayName = "ImagePreviewDialog";
