'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, PlatformStats } from '@/lib/api/admin';
import { 
  Users, 
  Package, 
  Calendar, 
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Listings',
      value: stats?.totalListings || 0,
      icon: Package,
      description: 'Active listings',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      description: 'Completed bookings',
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `ETB ${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      description: 'Platform earnings',
      trend: '+18%',
      trendUp: true,
    },
  ];

  const pendingCards = [
    {
      title: 'Pending Listings',
      value: stats?.pendingListings || 0,
      icon: Package,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: Star,
      description: 'Awaiting moderation',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Open Disputes',
      value: stats?.openDisputes || 0,
      icon: AlertCircle,
      description: 'Needs attention',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Main Stats */}
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
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.description}
                  {stat.trend && (
                    <span className={`ml-2 flex items-center ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Items */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Pending Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {pendingCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className={`${item.bg} border-0`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
                </div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Platform activity over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{new Date(activity.date).toLocaleDateString()}</span>
                <div className="flex gap-4">
                  <span className="text-sm">Users: <span className="font-medium">{activity.users}</span></span>
                  <span className="text-sm">Listings: <span className="font-medium">{activity.listings}</span></span>
                  <span className="text-sm">Bookings: <span className="font-medium">{activity.bookings}</span></span>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}