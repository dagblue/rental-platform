'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi, Notification } from '@/lib/api/notifications';

// Mock data for now
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request',
    message: 'John Doe wants to book your Camera Sony A7III from Mar 15 to Mar 20',
    read: false,
    actionUrl: '/dashboard/bookings/123',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed',
    message: 'Your booking for Mountain Bike has been confirmed',
    read: true,
    actionUrl: '/dashboard/bookings/456',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: 'You received ETB 7,500 for booking #123',
    read: false,
    actionUrl: '/dashboard/payments',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '4',
    type: 'REVIEW_RECEIVED',
    title: 'New Review',
    message: 'Abebe left you a 5-star review for Camera Sony A7III',
    read: true,
    actionUrl: '/dashboard/reviews',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '5',
    type: 'MESSAGE_RECEIVED',
    title: 'New Message',
    message: 'You have a new message from Tigist about your listing',
    read: false,
    actionUrl: '/dashboard/messages',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: '6',
    type: 'SYSTEM_ALERT',
    title: 'ID Verification Required',
    message: 'Please verify your ID to increase your trust level',
    read: false,
    actionUrl: '/dashboard/profile',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Use mock data for now
      setTimeout(() => {
        setNotifications(mockNotifications);
        setTotalPages(1);
        setIsLoading(false);
      }, 1000);
      
      // Real API call (commented out for now)
      // const response = await notificationsApi.getNotifications({ page: currentPage, limit: 10 });
      // if (response.success) {
      //   setNotifications(response.data.items);
      //   setTotalPages(Math.ceil(response.data.total / 10));
      // }
    } catch (error) {
      // toast.error('Failed to load notifications');
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      // Mock unread count
      setUnreadCount(3);
      
      // Real API call (commented out for now)
      // const response = await notificationsApi.getUnreadCount();
      // if (response.success) {
      //   setUnreadCount(response.data.count);
      // }
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Real API call (commented out for now)
      // await notificationsApi.markAsRead(notificationId);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      setSelectedNotifications(new Set());
      
      // Real API call (commented out for now)
      // await notificationsApi.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (selectedNotifications.has(notificationId)) {
        const newSelected = new Set(selectedNotifications);
        newSelected.delete(notificationId);
        setSelectedNotifications(newSelected);
      }
      
      // Real API call (commented out for now)
      // await notificationsApi.deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
      setSelectedNotifications(new Set());
      
      // Real API call (commented out for now)
      // await Promise.all(
      //   Array.from(selectedNotifications).map(id => notificationsApi.deleteNotification(id))
      // );
      toast.success('Notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const toggleSelectNotification = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_REFUNDED':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'REVIEW_RECEIVED':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'SYSTEM_ALERT':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = (tab: string) => {
    if (tab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your platform activity
          </p>
        </div>
        <div className="flex gap-2">
          {selectedNotifications.size > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedNotifications.size})
            </Button>
          )}
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <Checkbox
                        checked={selectedNotifications.has(notification.id)}
                        onCheckedChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(notification.type)}
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="bg-blue-500">New</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex gap-2">
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0" asChild>
                              <Link href={notification.actionUrl}>View Details</Link>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-red-600"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              {filteredNotifications('unread').length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No unread notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications('unread').map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedNotifications.has(notification.id)}
                        onCheckedChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(notification.type)}
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge className="bg-blue-500">New</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex gap-2">
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0" asChild>
                              <Link href={notification.actionUrl}>View Details</Link>
                            </Button>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-red-600"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
