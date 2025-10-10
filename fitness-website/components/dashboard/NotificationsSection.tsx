"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { EmptyState } from "./EmptyState";
import { CardSkeleton } from "./LoadingSkeleton";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

interface NotificationsSectionProps {
  notifications: Notification[];
  isLoading: boolean;
  onRefresh: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationsSection({ 
  notifications, 
  isLoading, 
  onRefresh, 
  onMarkAsRead, 
  onDelete 
}: NotificationsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <SectionCard
      title="Notifications"
      icon={Bell}
      iconColor="text-yellow-600"
      isLoading={isLoading}
      onRefresh={onRefresh}
      count={unreadCount}
    >
      {isLoading ? (
        <CardSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! No new notifications."
        />
      ) : (
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  !notification.is_read 
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" 
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      {!notification.is_read && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkAsRead(notification.id)}
                      disabled={notification.is_read}
                      title={notification.is_read ? "Already read" : "Mark as read"}
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <CheckCircle 
                        className={`h-4 w-4 ${
                          notification.is_read ? "text-gray-300" : "text-green-600 hover:text-green-700"
                        }`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(notification.id)}
                      title="Delete notification"
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </SectionCard>
  );
}
