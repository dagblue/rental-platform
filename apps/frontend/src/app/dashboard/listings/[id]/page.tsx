'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { listingsApi, Listing } from '@/lib/api/listings';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Shield, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewListingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await listingsApi.getListingById(listingId);
      if (response.success) {
        setListing(response.data);
      }
    } catch (error) {
      toast.error('Failed to load listing');
      router.push('/dashboard/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const response = await listingsApi.deleteListing(listingId);
      if (response.success) {
        toast.success('Listing deleted successfully');
        router.push('/dashboard/listings');
      }
    } catch (error) {
      toast.error('Failed to delete listing');
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

  if (!listing) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} type="button">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <Badge>{listing.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/listings/${listingId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-400">No images</p>
                )}
              </div>

              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{listing.categoryId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-medium">{listing.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Day</p>
                      <p className="font-medium">{listing.pricePerDay} ETB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum Rental</p>
                      <p className="font-medium">{listing.minimumRentalDays} days</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="description" className="mt-4">
                  <p>{listing.description}</p>
                </TabsContent>
                <TabsContent value="policies" className="mt-4">
                  <div className="space-y-2">
                    <p><span className="font-medium">Cancellation:</span> {listing.cancellationPolicy}</p>
                    <p><span className="font-medium">Trust Level Required:</span> {listing.minTrustLevel}</p>
                    {listing.requiresGuarantor && <p>✓ Requires guarantor</p>}
                    {listing.requiresIdVerification && <p>✓ Requires ID verification</p>}
                    {listing.requiresDeposit && <p>✓ Requires deposit ({listing.depositAmount} ETB)</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Location</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <div>
                  <p>{listing.city}, {listing.region}</p>
                  <p className="text-sm text-muted-foreground">Woreda {listing.woreda}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Delivery Options</h3>
              {listing.deliveryAvailable ? (
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 mt-1" />
                  <div>
                    <p>Delivery available</p>
                    <p className="text-sm text-muted-foreground">Fee: {listing.deliveryFee} ETB</p>
                  </div>
                </div>
              ) : (
                <p>Pickup only</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
