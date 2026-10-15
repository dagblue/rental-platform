'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package, CalendarDays, Wallet, Star, Plus, Search,
  ChevronRight, TrendingUp, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { listingsApi, Listing } from '@/lib/api/listings';
import { bookingsApi } from '@/lib/api/bookings';
import { paymentsApi } from '@/lib/api/payments';
import { reviewsApi } from '@/lib/api/reviews';
import { profileApi } from '@/lib/api/profile';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, bookings: 0, earnings: 0, rating: 0 });
  const [trust, setTrust] = useState<{ score: number; level: string } | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [listRes, bookRes, walletRes, reviewRes, trustRes, newListRes] = await Promise.allSettled([
        listingsApi.getMyListings(),
        bookingsApi.getUserBookings(),
        paymentsApi.getWallet(),
        reviewsApi.getUserReviews(),
        profileApi.getTrustData(),
        listingsApi.searchListings({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      const listingsCount = listRes.status === 'fulfilled' && listRes.value.success ? listRes.value.data.length : 0;
      const bookingsCount = bookRes.status === 'fulfilled' && bookRes.value.success ? bookRes.value.data.length : 0;
      const earnings = walletRes.status === 'fulfilled' && walletRes.value.success ? walletRes.value.data.balance : 0;
      let avgRating = 0;
      if (reviewRes.status === 'fulfilled' && reviewRes.value.success && reviewRes.value.data.items.length > 0) {
        avgRating = reviewRes.value.data.items.reduce((s: number, r: any) => s + r.rating, 0) / reviewRes.value.data.items.length;
      }
      if (trustRes.status === 'fulfilled' && trustRes.value.success) {
        setTrust({ score: trustRes.value.data.score, level: trustRes.value.data.level });
      }
      if (newListRes.status === 'fulfilled' && newListRes.value.success) {
        setRecentListings((newListRes.value.data.items as Listing[]).slice(0, 4));
      }
      setStats({ listings: listingsCount, bookings: bookingsCount, earnings, rating: avgRating });
      setIsLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Listings', value: stats.listings.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/listings' },
    { label: 'Active Bookings', value: stats.bookings.toString(), icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/bookings' },
    { label: 'Wallet Balance', value: `ETB ${stats.earnings.toLocaleString()}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/payments' },
    { label: 'Avg Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : '—', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/reviews' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your rentals today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-6 bg-white rounded-xl border hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </Link>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions + recent bookings */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/listings/create"
              className="flex items-center p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              <div className="p-2 bg-white/20 rounded-lg mr-4 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Create Listing</p>
                <p className="text-xs text-white/80">List a new item for rent</p>
              </div>
            </Link>
            <Link
              href="/search"
              className="flex items-center p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="p-2 bg-white/20 rounded-lg mr-4 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Browse Items</p>
                <p className="text-xs text-white/80">Find something you need</p>
              </div>
            </Link>
          </div>

          {/* Recent listings */}
          <div className="p-6 bg-white rounded-xl border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">My Recent Listings</h3>
              <Link
                href="/dashboard/listings"
                className="text-sm text-primary font-semibold flex items-center hover:underline"
              >
                View All <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : recentListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No listings yet</p>
                <Link href="/dashboard/listings/create" className="text-sm text-primary font-semibold hover:underline">
                  Create your first listing →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentListings.map((listing) => {
                  const img = listing.images?.[0]?.url;
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                        {img ? (
                          <Image src={img.startsWith('http') ? img : `/${img}`} alt={listing.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                          {listing.title}
                        </p>
                        <p className="text-xs text-slate-500">{listing.city} · ETB {listing.pricePerDay}/day</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        listing.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Trust level */}
          <div className="p-6 bg-white rounded-xl border">
            <h3 className="font-bold text-slate-900 mb-4">Account Status</h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {isLoading ? '…' : trust ? trust.level : 'NEW'}
                </p>
                <p className="text-xs text-slate-500">
                  Trust Score: {isLoading ? '…' : trust ? `${trust.score}%` : '0%'}
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${trust?.score ?? 0}%` }}
              />
            </div>
            <Link
              href="/dashboard/profile"
              className="block w-full text-center text-sm font-semibold border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors"
            >
              Manage Verification
            </Link>
          </div>

          {/* Earnings highlight */}
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h3 className="font-bold text-slate-900 mb-1 text-sm">Wallet Balance</h3>
            <p className="text-3xl font-black text-primary mb-0.5">
              ETB {isLoading ? '…' : stats.earnings.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mb-4">Available to withdraw</p>
            <Link
              href="/dashboard/payments"
              className="flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Manage Payments <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* New in Ethiopia — live listings */}
      {recentListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recently Added</h2>
            <Link href="/search" className="text-sm font-bold text-primary hover:underline flex items-center">
              See everything <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.map((listing) => {
              const img = listing.images?.[0]?.url;
              const src = img ? (img.startsWith('http') ? img : `/${img}`) : null;
              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="bg-white border rounded-xl overflow-hidden group"
                >
                  <div className="h-32 overflow-hidden relative bg-slate-100">
                    {src ? (
                      <Image
                        src={src}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm truncate text-slate-900">{listing.title}</h4>
                    <p className="text-primary font-black text-sm mt-0.5">
                      ETB {listing.pricePerDay}
                      <span className="text-[10px] text-slate-500 font-normal">/day</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
