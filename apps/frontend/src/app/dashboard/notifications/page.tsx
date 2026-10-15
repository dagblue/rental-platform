'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi, Notification } from '@/lib/api/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.getNotifications({
        page: currentPage,
        limit: 20,
      });
      if (response.success) {
        setNotifications(response.data.items);
        setUnreadCount(response.data.unreadCount);
        setTotalPages(Math.ceil(response.data.total / 20));
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setSelectedNotifications(new Set());
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setSelectedNotifications((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) =>
          notificationsApi.deleteNotification(id)
        )
      );
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.id))
      );
      setSelectedNotifications(new Set());
      toast.success('Notifications deleted');
    } catch {
      toast.error('Failed to delete notifications');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_REFUNDED':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'REVIEW_RECEIVED':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'SYSTEM_ALERT':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const NotificationRow = ({ notification }: { notification: Notification }) => (
    <div
      className={`flex items-start gap-3 p-4 border-b border-border/50 last:border-0 transition-colors ${
        !notification.read ? 'bg-primary/5' : 'hover:bg-muted/40'
      }`}
    >
      <Checkbox
        checked={selectedNotifications.has(notification.id)}
        onCheckedChange={() => toggleSelect(notification.id)}
        className="mt-0.5 shrink-0"
      />
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{notification.title}</span>
            {!notification.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2 leading-snug">{notification.message}</p>
        <div className="flex items-center gap-3">
          {notification.actionUrl && (
            <Link
              href={notification.actionUrl}
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              View details
            </Link>
          )}
          {!notification.read && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleMarkAsRead(notification.id)}
            >
              Mark as read
            </button>
          )}
          <button
            className="text-xs text-destructive/70 hover:text-destructive transition-colors"
            onClick={() => handleDelete(notification.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Stay updated with your platform activity
          </p>
        </div>
        <div className="flex gap-2">
          {selectedNotifications.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete ({selectedNotifications.size})
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/60 overflow-hidden">
        <Tabs defaultValue="all">
          <div className="px-4 pt-3 border-b border-border/60">
            <div className="flex items-center justify-between mb-2">
              {notifications.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={toggleSelectAll}
                >
                  {selectedNotifications.size === notifications.length
                    ? 'Deselect all'
                    : 'Select all'}
                </button>
              )}
            </div>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">
                All
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-primary">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">No notifications yet</p>
                <p className="text-xs text-muted-foreground">
                  You'll see activity updates here
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            {unread.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <CheckCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">All caught up</p>
                <p className="text-xs text-muted-foreground">
                  No unread notifications
                </p>
              </div>
            ) : (
              unread.map((n) => <NotificationRow key={n.id} notification={n} />)
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
