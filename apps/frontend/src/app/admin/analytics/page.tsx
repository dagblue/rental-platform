'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar, 
  DollarSign,
  Star,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Simple chart components (you can replace with recharts or other library)
const SimpleBarChart = ({ data }: { data: any[] }) => (
  <div className="space-y-2">
    {data.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        <span className="text-sm w-20">{item.label}</span>
        <div className="flex-1 h-8 bg-gray-100 rounded relative">
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded"
            style={{ width: `${item.percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium w-16">{item.value}</span>
      </div>
    ))}
  </div>
);

const SimpleLineChart = ({ data }: { data: any[] }) => (
  <div className="h-40 flex items-end gap-2">
    {data.map((item, index) => (
      <div key={index} className="flex-1 flex flex-col items-center gap-1">
        <div 
          className="w-full bg-primary/20 rounded-t"
          style={{ height: `${item.percentage}px` }}
        >
          <div 
            className="w-full bg-primary rounded-t"
            style={{ height: `${item.value}px` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{item.label}</span>
      </div>
    ))}
  </div>
);

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 1250,
      totalListings: 432,
      totalBookings: 876,
      totalRevenue: 456000,
      averageRating: 4.7,
      conversionRate: 12.5,
    },
    userGrowth: [
      { label: 'Mon', value: 25, percentage: 50 },
      { label: 'Tue', value: 35, percentage: 70 },
      { label: 'Wed', value: 45, percentage: 90 },
      { label: 'Thu', value: 40, percentage: 80 },
      { label: 'Fri', value: 50, percentage: 100 },
      { label: 'Sat', value: 30, percentage: 60 },
      { label: 'Sun', value: 20, percentage: 40 },
    ],
    popularCategories: [
      { label: 'Electronics', value: 145, percentage: 100 },
      { label: 'Vehicles', value: 98, percentage: 68 },
      { label: 'Furniture', value: 76, percentage: 52 },
      { label: 'Tools', value: 54, percentage: 37 },
      { label: 'Cameras', value: 32, percentage: 22 },
    ],
    topUsers: [
      { name: 'Abebe Kebede', listings: 12, bookings: 34, rating: 4.9 },
      { name: 'Almaz Worku', listings: 8, bookings: 28, rating: 4.8 },
      { name: 'Tigist Haile', listings: 15, bookings: 42, rating: 4.7 },
      { name: 'Dawit Mekonnen', listings: 6, bookings: 19, rating: 4.9 },
      { name: 'Meron Alemu', listings: 10, bookings: 31, rating: 4.6 },
    ],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch from your API
      // const response = await adminApi.getAnalytics({ range: dateRange });
      // if (response.success) {
      //   setAnalytics(response.data);
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <Select value={dateRange} onValueChange={(value: string) => setDateRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {analytics.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageRating}/5</div>
            <p className="text-xs text-muted-foreground">Based on 1,234 reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="categories">Popular Categories</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleLineChart data={analytics.userGrowth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>Most listed categories by volume</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={analytics.popularCategories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Platform revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Revenue chart coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Users</CardTitle>
          <CardDescription>Users with highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.listings} listings • {user.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
