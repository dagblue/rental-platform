'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Eye } from 'lucide-react';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getUserBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const filterBookings = (status?: string) => {
    if (!status || status === 'all') return bookings;
    return bookings.filter(b => b.status.toLowerCase() === status.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your rental bookings</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({bookings.filter(b => b.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({bookings.filter(b => b.status === 'CONFIRMED').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({bookings.filter(b => b.status === 'COMPLETED').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            {filterBookings(tab === 'all' ? undefined : tab).length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No bookings found</CardTitle>
                  <CardDescription>
                    {tab === 'all' 
                      ? "You haven't made any bookings yet" 
                      : `No ${tab} bookings at the moment`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              filterBookings(tab === 'all' ? undefined : tab).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          {booking.image ? (
                            <img src={booking.image} alt={booking.listingTitle} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Calendar className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{booking.listingTitle}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-2">
                            <Badge className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{booking.totalPrice} ETB</p>
                        <Button 
                          variant="link" 
                          className="mt-2" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
