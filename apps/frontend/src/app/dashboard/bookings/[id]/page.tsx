'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { paymentsApi } from '@/lib/api/payments';
import { bookingsApi } from '@/lib/api/bookings';
import { listingsApi } from '@/lib/api/listings';
import { ChevronLeft, CreditCard, Smartphone, Building2 } from 'lucide-react';

const PAYMENT_PROVIDERS = [
  { id: 'CBE_BIRR', name: 'CBE Birr', icon: Smartphone, description: 'Pay with CBE Birr mobile money' },
  { id: 'TELEBIRR', name: 'Telebirr', icon: Smartphone, description: 'Pay with Telebirr' },
  { id: 'MPESA', name: 'M-PESA', icon: Smartphone, description: 'Pay with M-PESA' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: Building2, description: 'Transfer to our bank account' },
  { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay with Visa or Mastercard' },
];

export default function BookingPaymentPage() {
  const [booking, setBooking] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('CBE_BIRR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const bookingRes = await bookingsApi.getBookingById(bookingId);
      if (bookingRes.success) {
        setBooking(bookingRes.data);
        
        // Fetch listing details
        const listingRes = await listingsApi.getListingById(bookingRes.data.listingId);
        if (listingRes.success) {
          setListing(listingRes.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedProvider) {
      toast.error('Please select a payment method');
      return;
    }

    if ((selectedProvider === 'CBE_BIRR' || selectedProvider === 'TELEBIRR' || selectedProvider === 'MPESA') && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await paymentsApi.processPayment({
        bookingId,
        amount: booking?.totalPrice || 0,
        provider: selectedProvider as any,
        phoneNumber: phoneNumber || undefined,
      });

      if (response.success) {
        toast.success('Payment initiated successfully');
        // Redirect to booking confirmation
        router.push(`/bookings/${bookingId}/confirmation`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Booking
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Choose your preferred payment method to secure your booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
                {PAYMENT_PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <div key={provider.id} className="flex items-start space-x-3 space-y-0 border p-4 rounded-lg">
                      <RadioGroupItem value={provider.id} id={provider.id} />
                      <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              {(selectedProvider === 'CBE_BIRR' || selectedProvider === 'TELEBIRR' || selectedProvider === 'MPESA') && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Mobile Money Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+251 91 234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a payment prompt on your phone
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ${booking?.totalPrice} ETB`}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing && (
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
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking?.startDate).toLocaleDateString()} - {new Date(booking?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{booking?.totalPrice} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{Math.round(booking?.totalPrice * 0.05)} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (15%)</span>
                  <span>{Math.round(booking?.totalPrice * 0.15)} ETB</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{Math.round(booking?.totalPrice * 1.2)} ETB</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-800">
                  Your payment will be held securely in escrow until your rental is complete. 
                  Funds are only released to the owner after you confirm everything is satisfactory.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}