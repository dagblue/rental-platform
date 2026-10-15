'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listingsApi, Listing } from '@/lib/api/listings';
import { Plus, MoreVertical, Eye, Edit, Trash2, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusStyles: Record<string, string> = {
  ACTIVE:         'bg-green-100 text-green-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  INACTIVE:       'bg-slate-100 text-slate-600',
  BANNED:         'bg-red-100 text-red-700',
};

export default function MyListingsPage() {
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const res = await listingsApi.getMyListings();
      if (!res.success) throw new Error('Failed to load');
      return res.data as Listing[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      const res = await listingsApi.deleteListing(id);
      if (res.success) {
        toast.success('Listing deleted');
        queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      }
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const items = listings ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage the items you are renting out.</p>
        </div>
        <Link
          href="/dashboard/listings/create"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl border border-dashed">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No listings yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start earning by listing your first item.</p>
          <Link
            href="/dashboard/listings/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((listing) => {
            const img = listing.images?.[0]?.url;
            const src = img ? (img.startsWith('http') ? img : `/${img}`) : null;
            return (
              <div
                key={listing.id}
                className="bg-white rounded-xl border overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  {src ? (
                    <Image
                      src={src}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[listing.status] || 'bg-slate-100 text-slate-600'}`}>
                      {listing.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}`} className="flex items-center gap-2">
                            <Eye className="w-4 h-4" /> View Public
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/listings/${listing.id}/edit`} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Edit Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(listing.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{listing.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-4">{listing.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-lg font-black text-primary">ETB {listing.pricePerDay}</span>
                      <span className="text-xs text-slate-500 ml-1">/day</span>
                    </div>
                    <span className="text-xs text-slate-400">{listing.city}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
