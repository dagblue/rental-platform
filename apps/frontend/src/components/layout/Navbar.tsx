'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Package,
  Calendar,
  CreditCard,
  Star,
  Settings,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { messagesApi } from '@/lib/api/messages';
import { notificationsApi } from '@/lib/api/notifications';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();  // Added isLoading here
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotificationCount();
      
      const messageInterval = setInterval(fetchUnreadCount, 30000);
      const notificationInterval = setInterval(fetchNotificationCount, 60000);
      
      return () => {
        clearInterval(messageInterval);
        clearInterval(notificationInterval);
      };
    }
  }, [user]);

  // Show loading skeleton while auth is initializing
  if (isLoading) {
    return (
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-primary">Rental Platform</div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Don't show navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) return null;

  const fetchUnreadCount = async () => {
    try {
      const response = await messagesApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.total);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch unread count:', error);
      }
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      if (response.success) {
        setNotificationCount(response.data.count);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch notification count:', error);
      }
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayPhone = () => {
    if (!user) return '';
    if (typeof user.phone === 'object' && user.phone !== null) {
      const phoneObj = user.phone as { formatted?: string; number?: string };
      return phoneObj.formatted || phoneObj.number || 'Phone number';
    }
    return user.phone;
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Listings', href: '/dashboard/listings', icon: Package },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            Rental Platform
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/search"
              className="flex items-center gap-1 text-gray-700 hover:text-primary"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Explore</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications Bell */}
                <Link href="/dashboard/notifications" className="relative">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Hamburger Menu Button with Unread Badge */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  {!isMenuOpen && unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getDisplayPhone()}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Menu Panel */}
      {isMenuOpen && user && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 p-6 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{getDisplayPhone()}</p>
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.name === 'Messages' && unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {unreadCount}
                      </Badge>
                    )}
                    {item.name === 'Notifications' && notificationCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {notificationCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="border-t mt-6 pt-6">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}