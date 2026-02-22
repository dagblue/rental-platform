'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail } from 'lucide-react';

export default function BookingDetailsPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsApi.getBookingById(bookingId);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      toast.error('Failed to load booking');
      router.push('/dashboard/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const response = await bookingsApi.cancelBooking(bookingId);
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBooking();
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
        <Badge>{booking.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Listing</p>
              <p className="font-medium">{booking.listingTitle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dates</p>
              <p className="font-medium">
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="font-medium">{booking.totalPrice} ETB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.status === 'PENDING' && (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancel}
              >
                Cancel Booking
              </Button>
            )}
            {booking.status === 'CONFIRMED' && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/dashboard/messages?booking=${bookingId}`)}
              >
                Contact Owner
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
