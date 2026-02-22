'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listingsApi, Listing } from '@/lib/api/listings';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsApi.getMyListings();
      if (response.success) {
        setListings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const response = await listingsApi.deleteListing(id);
      if (response.success) {
        toast.success('Listing deleted successfully');
        fetchListings();
      }
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      BANNED: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your rental listings</p>
        </div>
        <Button onClick={() => router.push('/dashboard/listings/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any listings yet</p>
            <Button onClick={() => router.push('/dashboard/listings/create')}>
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <Badge className={`absolute top-2 right-2 ${getStatusBadge(listing.status)}`}>
                  {listing.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                <CardDescription>
                  {listing.pricePerDay} ETB / day
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/listings/${listing.id}`)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
