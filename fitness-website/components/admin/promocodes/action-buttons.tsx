"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ActionButtonsProps {
  onAddClick: () => void;
}

const ActionButtons = React.memo(({ onAddClick }: ActionButtonsProps) => {
  const handleAddClick = React.useCallback(() => {
    onAddClick();
  }, [onAddClick]);

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleAddClick}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        <Plus className="h-5 w-5 mr-2" /> New Promo Code
      </Button>
    </div>
  );
});

ActionButtons.displayName = "ActionButtons";

export { ActionButtons };
