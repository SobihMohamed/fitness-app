"use client";

import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Wrench } from "lucide-react";
import type { Service, ServiceFormData } from "@/types";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: Service | null;
  onSubmit: (formData: ServiceFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const ServiceForm = React.memo<ServiceFormProps>(({ 
  open, 
  onOpenChange, 
  editingService, 
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    details: "",
    duration: "",
    price: "",
    picture: null,
  });

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
    }
  }, [open, editingService]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.duration.trim() || !String(formData.price).trim()) {
      return;
    }

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  }, [formData, onSubmit, onOpenChange]);

  const handleInputChange = useCallback((field: keyof ServiceFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('picture', file);
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
              <label className="text-sm font-semibold text-slate-700">Title *</label>
              <Input
                placeholder="e.g. Personal Training"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Price *</label>
              <Input
                placeholder="e.g. 99"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration *</label>
              <Input
                placeholder="e.g. 60 minutes"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                required
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Details</label>
            <Textarea
              rows={4}
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Describe the service..."
              className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
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
              disabled={isSubmitting || !formData.title.trim() || !formData.duration.trim() || !formData.price.trim()} 
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
});

ServiceForm.displayName = "ServiceForm";
