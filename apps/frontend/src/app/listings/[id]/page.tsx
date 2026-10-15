'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { listingsApi, Listing } from '@/lib/api/listings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Star, MapPin, ShieldCheck, Calendar, MessageSquare, Share2, Heart,
  ChevronLeft, ChevronRight, Check, Package, Truck, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function imgSrc(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function ListingDetailPage() {
  const [activeImg, setActiveImg] = useState(0);
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const res = await listingsApi.getListingById(listingId);
      if (!res.success) throw new Error('Not found');
      return res.data as Listing;
    },
  });

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/listings/${listingId}/book`);
      return;
    }
    if (listing && user.id === listing.ownerId) {
      toast.error("You can't book your own listing");
      return;
    }
    router.push(`/listings/${listingId}/book`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-16 border-b" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="flex gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="w-20 h-14 rounded-lg" />)}
              </div>
            </div>
            <div><Skeleton className="h-96 w-full rounded-2xl" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Listing not found</h1>
          <Link href="/search" className="text-primary font-semibold hover:underline">
            ← Back to search
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [];
  const ownerName = listing.owner
    ? `${listing.owner.firstName || ''} ${listing.owner.lastName || ''}`.trim() || 'Owner'
    : 'Owner';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="h-16 border-b flex items-center px-4 md:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Content column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 relative group">
                {images[activeImg]?.url ? (
                  <Image
                    src={imgSrc(images[activeImg].url)}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-slate-200" />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(p => p > 0 ? p - 1 : images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImg(p => p < images.length - 1 ? p + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={cn(
                        'w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                        activeImg === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                    >
                      <div className="relative w-full h-full">
                        {img.url ? (
                          <Image src={imgSrc(img.url)} alt="" fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full bg-slate-100" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                      {listing.categoryId}
                    </span>
                    {listing.owner?.reviewCount && listing.owner.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {listing.owner.averageRating?.toFixed(1)} ({listing.owner.reviewCount} reviews)
                      </div>
                    ) : null}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{listing.title}</h1>
                  <p className="flex items-center gap-1 text-slate-500 mt-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    {listing.city}, {listing.region?.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Heart className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Share2 className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Specs */}
            {(listing.brand || listing.model || listing.yearOfManufacture || listing.condition) && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Condition', value: listing.condition?.replace(/_/g, ' ') },
                    { label: 'Brand', value: listing.brand },
                    { label: 'Model', value: listing.model },
                    { label: 'Year', value: listing.yearOfManufacture?.toString() },
                  ].filter(s => s.value).map(spec => (
                    <div key={spec.label}>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{spec.label}</p>
                      <p className="text-sm font-bold text-slate-900">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Cancellation Policy</p>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.cancellationPolicy}</p>
                  </div>
                </div>
                {listing.requiresDeposit && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Security Deposit Required</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {listing.depositAmount ? `ETB ${listing.depositAmount} (refundable)` : 'Amount TBD'}
                      </p>
                    </div>
                  </div>
                )}
                {listing.deliveryAvailable && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Delivery Available</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {listing.deliveryFee ? `ETB ${listing.deliveryFee} delivery fee` : 'Ask owner for details'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Min Trust Level</p>
                    <p className="text-xs text-slate-500 mt-0.5">{listing.minTrustLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Price */}
                <div>
                  <span className="text-3xl font-black text-primary">ETB {listing.pricePerDay}</span>
                  <span className="text-slate-500 ml-1 text-sm">/day</span>
                </div>

                {/* Min days */}
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  Minimum rental: <span className="font-semibold text-slate-700">{listing.minimumRentalDays} day{listing.minimumRentalDays > 1 ? 's' : ''}</span>
                </div>

                {/* Book button */}
                <button
                  onClick={handleBook}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-xl transition-colors shadow-md"
                >
                  Request to Book
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold">
                  <Info className="w-3 h-3" /> You won&apos;t be charged yet
                </p>
              </div>

              {/* Owner section */}
              <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                    {listing.owner
                      ? `${listing.owner.firstName?.[0] || ''}${listing.owner.lastName?.[0] || ''}`.toUpperCase()
                      : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-slate-900">{ownerName}</p>
                      <Check className="w-3.5 h-3.5 text-blue-500 bg-blue-100 rounded-full p-0.5" />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Trust: {listing.owner?.trustLevel || listing.minTrustLevel}
                    </p>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
