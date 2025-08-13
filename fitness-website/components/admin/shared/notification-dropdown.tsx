"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_CONFIG } from "@/config/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  notification_id: string;
  message_title: string;
  content: string;
  is_read: boolean;
  delivered_at: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.getAllNotificationForThisAdmin, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert is_read to boolean values
        const notificationsWithBoolean = data.data?.map((notif: any) => ({
          ...notif,
          is_read: Boolean(notif.is_read)
        })) || [];
        setNotifications(notificationsWithBoolean);
        const unread = notificationsWithBoolean.filter((notif: Notification) => !notif.is_read).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.MarkAsRead(notificationId),
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.notification_id === notificationId
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.DeleteNotification(notificationId),
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notif => notif.notification_id !== notificationId)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(
          notif => notif.notification_id === notificationId
        );
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 mt-2 mr-4"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <span className="text-sm text-muted-foreground">
              {notifications.length} total
            </span>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">
                      {notification.message_title}
                    </h4>
                    {!notification.is_read && (
                      <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.content}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(notification.delivered_at)}
                    </span>
                    <div className="flex space-x-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.notification_id)}
                          className="flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          <span>Read</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.notification_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}