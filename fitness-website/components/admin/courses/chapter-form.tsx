"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit3, Save, Loader2 } from "lucide-react";
import type { Chapter, ChapterFormData } from "@/types";

interface ChapterFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingChapter: Chapter | null;
  formData: ChapterFormData;
  onFormDataChange: (data: ChapterFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const ChapterForm = React.memo<ChapterFormProps>(({
  isOpen,
  onClose,
  editingChapter,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-xl">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 absolute top-0 left-0 right-0 rounded-t-xl"></div>
        <DialogHeader className="pt-6">
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {editingChapter ? (
              <>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-indigo-600" />
                </div>
                Edit Chapter
              </>
            ) : (
              <>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Plus className="h-5 w-5 text-indigo-600" />
                </div>
                Add Chapter
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-1">
            {editingChapter
              ? "Update the chapter details."
              : "Create a new chapter for this module."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  onFormDataChange({ ...formData, title: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter chapter title"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Order Number
              </label>
              <Input
                type="number"
                min={0}
                value={formData.order_number}
                onChange={(e) =>
                  onFormDataChange({ ...formData, order_number: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter order number"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Video Link
              </label>
              <Input
                type="url"
                value={formData.video_link}
                onChange={(e) =>
                  onFormDataChange({ ...formData, video_link: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none"
                placeholder="Enter chapter description"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-300 hover:bg-slate-100 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingChapter ? "Save Changes" : "Create Chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

ChapterForm.displayName = "ChapterForm";
