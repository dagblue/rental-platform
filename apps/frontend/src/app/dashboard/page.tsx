'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, CreditCard, Star } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Listings',
      value: '0',
      icon: Package,
      description: 'Active listings',
    },
    {
      title: 'Active Bookings',
      value: '0',
      icon: Calendar,
      description: 'Upcoming rentals',
    },
    {
      title: 'Total Earnings',
      value: '0 ETB',
      icon: CreditCard,
      description: 'Lifetime earnings',
    },
    {
      title: 'Average Rating',
      value: '0/5',
      icon: Star,
      description: 'From 0 reviews',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
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
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Create a listing, check bookings, etc.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
