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
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  // Local overlay to persist read IDs for UI, in case backend doesn't update immediately
  const LOCAL_READ_KEY = "adminNotificationReadIds";
  const getLocalReadIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem(LOCAL_READ_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      return new Set(arr.map(String));
    } catch {
      return new Set();
    }
  };
  const addLocalReadId = (id: string) => {
    try {
      const set = getLocalReadIds();
      set.add(String(id));
      localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  };
  const removeLocalReadId = (id: string) => {
    try {
      const set = getLocalReadIds();
      set.delete(String(id));
      localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminAuth");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Robust read-state normalization (handles 0/1, "0"/"1", booleans, etc.)
  const isReadNormalized = (val: any) => {
    return (
      val === true ||
      val === 1 ||
      val === "1" ||
      val === "true" ||
      val === "yes"
    );
  };

  const fetchNotifications = async () => {
    try {
      // cache-busting to avoid stale reads after updates
      const baseUrl = API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.getAllNotificationForThisAdmin;
      const url = typeof baseUrl === "string" ? `${baseUrl}?ts=${Date.now()}` : baseUrl;
      const response = await fetch(url as string, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        // Normalize items: ensure id exists and parse is_read correctly
        const normalized: Notification[] = (data?.data || data?.notifications || [])
          .map((raw: any) => {
            const rawRead = raw?.is_read ?? raw?.isRead ?? raw?.read;
            const isRead =
              rawRead === true ||
              rawRead === 1 ||
              rawRead === "1" ||
              rawRead === "true" ||
              rawRead === "yes";
            return {
              notification_id: String(
                raw?.notification_id ?? raw?._id ?? raw?.id ?? ""
              ),
              message_title: raw?.message_title ?? raw?.title ?? "",
              content: raw?.content ?? raw?.message ?? "",
              is_read: !!isRead,
              delivered_at: raw?.delivered_at ?? raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
            } as Notification;
          })
          .filter((n: Notification) => n.notification_id);

        // Merge local overlay: any id in local set is treated as read in UI
        const localSet = getLocalReadIds();
        const merged = normalized.map((n) =>
          localSet.has(String(n.notification_id)) ? { ...n, is_read: true } : n
        );

        setNotifications(merged);
        const unread = merged.filter((notif: Notification) => !notif.is_read).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // prevent duplicate requests for the same notification
      if (markingIds[notificationId]) return;
      setMarkingIds((prev) => ({ ...prev, [notificationId]: true }));

      const url = API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.MarkAsRead(notificationId);
      console.log("[AdminNotifications] MarkAsRead:", url, notificationId);

      // OPTIMISTIC UPDATE: flip to read immediately
      setNotifications((prev) => {
        const next = prev.map((n) =>
          String(n.notification_id) === String(notificationId)
            ? { ...n, is_read: true }
            : n
        );
        const newUnread = next.filter((n) => !n.is_read).length;
        setUnreadCount(newUnread);
        return next;
      });

      // Attempt 1: PUT with empty JSON body
      let response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      // Attempt 2: Some servers reject body for PUT (400/415) -> retry with no body
      if (!response.ok && (response.status === 400 || response.status === 415)) {
        console.warn("MarkAsRead PUT with body failed, retrying without body. Status:", response.status);
        response = await fetch(url, {
          method: "PUT",
          headers: getAuthHeaders(),
        });
      }

      // Attempt 3: If method not allowed (405), fallback to POST
      if (!response.ok && response.status === 405) {
        console.warn("MarkAsRead PUT not allowed, retrying with POST");
        response = await fetch(url, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({}),
        });
      }

      if (response.ok) {
        console.log("Mark as read confirmed by server:", notificationId);
        // Do not refetch immediately; rely on polling to avoid stale overrides
        addLocalReadId(notificationId);
      } else {
        const text = await response.text();
        console.error("Mark as read failed:", response.status, text);
        // REVERT optimistic update on failure
        setNotifications((prev) => {
          const next = prev.map((n) =>
            String(n.notification_id) === String(notificationId)
              ? { ...n, is_read: false }
              : n
          );
          const newUnread = next.filter((n) => !n.is_read).length;
          setUnreadCount(newUnread);
          return next;
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // REVERT optimistic update on exception
      setNotifications((prev) => {
        const next = prev.map((n) =>
          String(n.notification_id) === String(notificationId)
            ? { ...n, is_read: false }
            : n
        );
        const newUnread = next.filter((n) => !n.is_read).length;
        setUnreadCount(newUnread);
        return next;
      });
    }
    finally {
      setMarkingIds((prev) => {
        const { [notificationId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      if (deletingIds[notificationId]) return;
      setDeletingIds((prev) => ({ ...prev, [notificationId]: true }));

      // If unread, mark as read first to satisfy backends that forbid deleting unread items
      const target = notifications.find(n => n.notification_id === notificationId);
      if (target && !target.is_read) {
        await markAsRead(notificationId);
      }

      const url = API_CONFIG.ADMIN_FUNCTIONS.AdminNotifications.DeleteNotification(notificationId);
      console.log("[AdminNotifications] Delete:", url, notificationId);

      let response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status === 405) {
        console.warn("Delete with DELETE not allowed, retrying with POST");
        response = await fetch(url, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({}),
        });
      }

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notif => notif.notification_id !== notificationId)
        );
        // Maintain local overlay
        removeLocalReadId(notificationId);
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(
          notif => notif.notification_id === notificationId
        );
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const text = await response.text();
        console.error("Delete notification failed:", response.status, text);
        // Re-sync from server to reconcile any mismatch
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingIds((prev) => {
        const { [notificationId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Always keep counts fresh even when dropdown is closed
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full">
              {notifications.length}
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
              {notifications.map((notification) => {
                const isRead = isReadNormalized((notification as any).is_read);
                return (
                <div
                  key={notification.notification_id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    !isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">
                      {notification.message_title}
                    </h4>
                    {!isRead && (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.notification_id)}
                        disabled={!!deletingIds[notification.notification_id]}
                        aria-label="Delete notification"
                        title={deletingIds[notification.notification_id] ? "Deleting..." : "Delete"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.notification_id)}
                        disabled={isRead || !!markingIds[notification.notification_id]}
                        aria-label="Mark as read"
                        title={isRead ? "Already read" : (markingIds[notification.notification_id] ? "Marking..." : "Mark as read")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}