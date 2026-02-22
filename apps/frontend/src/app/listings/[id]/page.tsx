'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { listingsApi, Listing } from '@/lib/api/listings';
import { 
  MapPin, 
  Calendar, 
  Shield, 
  Truck, 
  Star, 
  ChevronLeft,
  Heart,
  Share2,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext'; // Add this import

export default function PublicListingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { user } = useAuth(); // Add this

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
    } finally {
      setIsLoading(false);
    }
  };

  // Add this handler
  const handleBookingClick = () => {
    if (!user) {
      // Not logged in - redirect to login with return URL
      router.push(`/login?redirect=/listings/${listingId}/book`);
      return;
    }

    if (listing && user.id === listing.ownerId) {
      // Trying to book own listing
      toast.error("You cannot book your own listing");
      return;
    }

    // All good - proceed to booking
    router.push(`/listings/${listingId}/book`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Button onClick={() => router.push('/search')}>Browse Listings</Button>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [{ url: null }];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images */}
        <div className="lg:col-span-2">
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {images[selectedImage]?.url ? (
              <img 
                src={images[selectedImage].url} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  {img.url ? (
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Booking card */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              {/* Title and actions */}
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(24 reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold">{listing.pricePerDay} ETB</span>
                <span className="text-muted-foreground"> / day</span>
              </div>

              {/* Book button - UPDATED */}
              <Button 
                className="w-full mb-4" 
                size="lg"
                onClick={handleBookingClick}
              >
                Request to Book
              </Button>

              {/* Owner info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Listed by {listing.ownerId?.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">Member since 2024</p>
                </div>
              </div>

              {/* Listing details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.city}, {listing.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Trust Level: {listing.minTrustLevel}</span>
                </div>
                {listing.deliveryAvailable && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>Delivery available {listing.deliveryFee ? `• ${listing.deliveryFee} ETB` : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Min. rental: {listing.minimumRentalDays} day(s)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs section (unchanged) */}
      <div className="mt-8">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="whitespace-pre-line">{listing.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{listing.condition}</p>
                  </div>
                  {listing.brand && (
                    <div>
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-medium">{listing.brand}</p>
                    </div>
                  )}
                  {listing.model && (
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{listing.model}</p>
                    </div>
                  )}
                  {listing.yearOfManufacture && (
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{listing.yearOfManufacture}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews yet
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                    <p className="text-sm text-muted-foreground">{listing.cancellationPolicy}</p>
                  </div>
                  {listing.rules && listing.rules.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Rules</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {listing.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}