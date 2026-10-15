'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, CalendarDays, MessageSquare, Bell,
  Wallet, Star, UserCircle, LogOut, Search, Menu, X, Settings,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { messagesApi } from '@/lib/api/messages';
import { notificationsApi } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/dashboard' },
  { icon: Package,         label: 'My Listings',   href: '/dashboard/listings' },
  { icon: CalendarDays,    label: 'My Bookings',   href: '/dashboard/bookings' },
  { icon: MessageSquare,   label: 'Messages',      href: '/dashboard/messages' },
  { icon: Bell,            label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Wallet,          label: 'Payments',      href: '/dashboard/payments' },
  { icon: Star,            label: 'Reviews',       href: '/dashboard/reviews' },
  { icon: UserCircle,      label: 'Profile',       href: '/dashboard/profile' },
];

function SidebarContent({
  pathname, user, unreadMsg, unreadNotif, onLogout, onNavigate,
}: {
  pathname: string;
  user: any;
  unreadMsg: number;
  unreadNotif: number;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const getInitials = () =>
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const getPhone = () => {
    if (!user?.phone) return '';
    if (typeof user.phone === 'object') {
      const p = user.phone as { formatted?: string; number?: string };
      return p.formatted || p.number || '';
    }
    return user.phone;
  };

  const getBadge = (href: string) => {
    if (href === '/dashboard/messages') return unreadMsg;
    if (href === '/dashboard/notifications') return unreadNotif;
    return 0;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 w-64 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white">Rental Platform</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badge = getBadge(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group',
                isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn('w-5 h-5', isActive ? 'text-white' : 'group-hover:text-slate-200')} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {badge > 0 && !isActive && (
                <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => { onLogout(); onNavigate?.(); }}
          className="flex items-center w-full p-2 rounded-lg hover:bg-slate-900 transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 mr-3 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{getPhone()}</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const [m, n] = await Promise.allSettled([
        messagesApi.getUnreadCount(),
        notificationsApi.getUnreadCount(),
      ]);
      if (m.status === 'fulfilled' && m.value.success) setUnreadMsg(m.value.data.total);
      if (n.status === 'fulfilled' && n.value.success) setUnreadNotif(n.value.data.count);
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 30000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="hidden md:flex w-64 flex-col bg-slate-950 border-r border-slate-800 p-4 gap-3">
          <Skeleton className="h-8 w-36 bg-slate-800" />
          <div className="space-y-1 mt-4">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-10 w-full bg-slate-800" />)}
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarProps = {
    pathname, user, unreadMsg, unreadNotif, onLogout: logout,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-full shrink-0">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 md:hidden shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center flex-1 gap-3">
            <button
              className="md:hidden p-2 -ml-2 text-slate-600"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="max-w-sm w-full relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Link href="/search">
                <div className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
                  Search listings...
                </div>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="p-2 relative rounded-full hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadNotif > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Link>
            <Link href="/dashboard/messages" className="p-2 relative rounded-full hover:bg-slate-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              {unreadMsg > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              )}
            </Link>
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ml-1">
                {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
