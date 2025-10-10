"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  count?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
  headerActions?: ReactNode;
}

export function SectionCard({
  title,
  icon: Icon,
  iconColor,
  count,
  isLoading = false,
  onRefresh,
  children,
  headerActions
}: SectionCardProps) {
  return (
    <Card className="bg-white shadow-sm border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <span className="text-lg font-semibold">{title}</span>
            {count !== undefined && (
              <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-700">
                {count}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRefresh} 
                title={`Refresh ${title.toLowerCase()}`}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
