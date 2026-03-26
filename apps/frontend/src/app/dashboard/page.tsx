'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, CreditCard, Star } from 'lucide-react';
import { listingsApi } from '@/lib/api/listings';
import { bookingsApi } from '@/lib/api/bookings';
import { paymentsApi } from '@/lib/api/payments';
import { reviewsApi } from '@/lib/api/reviews';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    listings: 0,
    bookings: 0,
    earnings: 0,
    rating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's listings
      const listingsRes = await listingsApi.getMyListings();
      const listingsCount = listingsRes.success ? listingsRes.data.length : 0;

      // Fetch user's bookings (as renter and owner)
      const bookingsRes = await bookingsApi.getUserBookings();
      const bookingsCount = bookingsRes.success ? bookingsRes.data.length : 0;

      // Fetch wallet balance
      const walletRes = await paymentsApi.getWallet();
      const earnings = walletRes.success ? walletRes.data.balance : 0;

      // Fetch user's reviews
      const reviewsRes = await reviewsApi.getUserReviews();
      let avgRating = 0;
      if (reviewsRes.success && reviewsRes.data.items.length > 0) {
        const total = reviewsRes.data.items.reduce((sum, review) => sum + review.rating, 0);
        avgRating = total / reviewsRes.data.items.length;
      }

      setStats({
        listings: listingsCount,
        bookings: bookingsCount,
        earnings: earnings,
        rating: avgRating,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.listings.toString(),
      icon: Package,
      description: 'Active listings',
    },
    {
      title: 'Active Bookings',
      value: stats.bookings.toString(),
      icon: Calendar,
      description: 'Upcoming rentals',
    },
    {
      title: 'Total Earnings',
      value: `${stats.earnings} ETB`,
      icon: CreditCard,
      description: 'Lifetime earnings',
    },
    {
      title: 'Average Rating',
      value: stats.rating > 0 ? `${stats.rating.toFixed(1)}/5` : '0/5',
      icon: Star,
      description: `From ${stats.listings} listings`,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {stats.listings > 0
                ? `You have ${stats.listings} active listing${stats.listings !== 1 ? 's' : ''}`
                : 'Create your first listing to get started!'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/dashboard/listings/create"
                className="text-sm text-primary hover:underline block"
              >
                + Create a new listing
              </a>
              <a href="/search" className="text-sm text-primary hover:underline block">
                Browse items to rent
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
