'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Package,
  Star,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, router]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Listings', href: '/admin/listings', icon: Package },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Reports', href: '/admin/reports', icon: Flag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const getInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-1 flex-col bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Panel
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">View Site</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b">
                <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </Link>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Icon className="mr-3 h-5 w-5 text-gray-400" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 pt-16 md:pt-0">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}