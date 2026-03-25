'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { listingsApi, Listing } from '@/lib/api/listings';
import { bookingsApi } from '@/lib/api/bookings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const bookingSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  message: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms",
  }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const listingId = params.id as string;

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      message: '',
      agreeToTerms: false,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/listings/${listingId}/book`);
      return;
    }
    fetchListing();
  }, [listingId, user, authLoading]);

  const fetchListing = async () => {
    try {
      const response = await listingsApi.getListingById(listingId);
      if (response.success) {
        setListing(response.data);
      }
    } catch (error) {
      toast.error('Failed to load listing');
      router.push('/search');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = (startDate: Date, endDate: Date) => {
    if (!listing) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * listing.pricePerDay;
  };

  const onSubmit = async (data: BookingForm) => {
    if (!listing) return;
    setIsSubmitting(true);

    try {
      const totalPrice = calculateTotal(data.startDate, data.endDate);
      
      const bookingData = {
        listingId: listing.id,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        message: data.message,
        totalPrice,
      };

      const response = await bookingsApi.createBooking(bookingData);
      if (response.success) {
        toast.success('Booking request sent successfully');
        router.push('/dashboard/bookings');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const totalPrice = watchStartDate && watchEndDate ? calculateTotal(watchStartDate, watchEndDate) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href={`/listings/${listingId}`}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to listing
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request to Book</CardTitle>
              <CardDescription>
                Fill in your booking details for {listing.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  date < new Date() || 
                                  (watchStartDate ? date <= watchStartDate : false)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Message to owner */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message to Owner (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell the owner about your plans for the rental..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Introduce yourself and let them know how you'll use the item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms agreement */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions
                          </FormLabel>
                          <FormDescription>
                            By booking, you agree to our rental terms and cancellation policy
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending request...' : 'Send Booking Request'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Price Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover rounded" />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground">{listing.pricePerDay} ETB / day</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Daily rate</span>
                  <span>{listing.pricePerDay} ETB</span>
                </div>
                {watchStartDate && watchEndDate && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span>Number of days</span>
                      <span>
                        {Math.ceil((watchEndDate.getTime() - watchStartDate.getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                      <span>Total</span>
                      <span>{totalPrice} ETB</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-4">
                <p>You won't be charged yet. The owner will confirm your request.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
