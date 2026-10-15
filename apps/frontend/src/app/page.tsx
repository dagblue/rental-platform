'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listingsApi, Listing } from '@/lib/api/listings';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Camera, Car, Sofa, Zap, ShieldCheck, Truck,
  ArrowRight, Star, MapPin, Package, CheckCircle,
  MessageSquare, Wallet, Menu, X,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: Camera,  color: 'bg-blue-50 text-blue-600',   q: 'electronics' },
  { name: 'Vehicles',    icon: Car,     color: 'bg-green-50 text-green-600',  q: 'vehicles' },
  { name: 'Furniture',   icon: Sofa,    color: 'bg-purple-50 text-purple-600',q: 'furniture' },
  { name: 'Tools',       icon: Zap,     color: 'bg-amber-50 text-amber-600',  q: 'tools' },
];

const STEPS = [
  { icon: Search,       title: 'Find what you need',    desc: 'Browse thousands of items across Ethiopia by category, region, or price.' },
  { icon: CheckCircle,  title: 'Request to book',       desc: 'Choose your dates, send a request, and chat with the owner directly.' },
  { icon: Wallet,       title: 'Pay & enjoy',           desc: 'Secure escrow payment. Funds release to the owner only after you confirm.' },
];

function imgSrc(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['home-listings'],
    queryFn: async () => {
      const res = await listingsApi.searchListings({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' });
      if (!res.success) throw new Error('Failed');
      return res.data.items as Listing[];
    },
  });

  const listings = data ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="h-18 border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl text-slate-900">Rental Platform</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/search" className="hover:text-primary transition-colors">Browse</Link>
            <Link href="/dashboard/listings/create" className="hover:text-primary transition-colors">List an Item</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <Link href="/search" className="block text-sm font-semibold py-2 text-slate-700" onClick={() => setMobileMenuOpen(false)}>Browse</Link>
            <Link href="/login" className="block text-sm font-semibold py-2 text-slate-700" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link
              href="/register"
              className="block w-full text-center bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ethiopia&apos;s trusted peer-to-peer rental marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
            Rent Anything,{' '}
            <span className="text-primary">Anywhere</span>{' '}
            in Ethiopia.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            From professional cameras to construction tools. Secure escrow payments, verified owners, and delivery options.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-xl rounded-full flex items-center p-2 mb-8"
          >
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="What do you need to rent?"
                className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> Verified Owners</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Instant Booking</span>
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-500" /> Delivery Available</span>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
              <p className="text-slate-500 mt-1">Find exactly what you are looking for.</p>
            </div>
            <Link href="/search" className="text-primary font-bold text-sm flex items-center hover:underline">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={`/search?category=${cat.q}`}
                className="group bg-white p-8 rounded-3xl border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 ${cat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Listings</h2>
              <p className="text-slate-500 mt-1">Recently added by verified owners</p>
            </div>
            <Link href="/search" className="text-primary font-bold text-sm flex items-center hover:underline">
              See All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No listings yet. Be the first to list an item.</p>
              <Link href="/register" className="inline-block mt-4 text-sm text-primary font-bold hover:underline">
                Create an account to list →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {listings.slice(0, 8).map(listing => {
                const src = imgSrc(listing.images?.[0]?.url);
                const rating = listing.owner?.averageRating;
                const rc = listing.owner?.reviewCount || 0;
                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group space-y-3"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-slate-100">
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
                      {rc > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {rating?.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-base font-black text-slate-900">
                          ETB {listing.pricePerDay}
                          <span className="text-xs text-slate-400 font-normal">/day</span>
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{listing.city}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">How It Works</h2>
            <p className="text-slate-500 max-w-md mx-auto">Renting is simple. Three steps and you&apos;re done.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-xs font-black text-primary/50 uppercase tracking-widest mb-2">Step {i + 1}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust banner ── */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(38,92%,50%,0.15),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                Join the marketplace where trust is standard.
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Whether you&apos;re looking to save money by renting or earn money by listing unused items — we have secure payments, ID verification, and real reviews.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
                >
                  List Your Item
                </Link>
                <Link
                  href="/search"
                  className="border border-slate-700 text-white hover:bg-slate-800 font-bold px-8 py-3.5 rounded-xl transition-colors"
                >
                  Browse Items
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {[
                { value: '10k+', label: 'Active Users', color: 'text-primary' },
                { value: '50k+', label: 'Rentals Done', color: 'text-green-400' },
                { value: '0%',   label: 'Fraud Rate',   color: 'text-blue-400' },
                { value: '24/7', label: 'Local Support', color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="p-6 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                  <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="text-white w-4 h-4" />
              </div>
              <span className="font-black text-lg text-slate-900">Rental Platform</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              The most trusted peer-to-peer rental marketplace in Ethiopia.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Marketplace</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/search" className="hover:text-primary transition-colors">Browse All</Link></li>
              <li><Link href="/search?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/search?category=vehicles" className="hover:text-primary transition-colors">Vehicles</Link></li>
              <li><Link href="/search?category=tools" className="hover:text-primary transition-colors">Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>info@rentalplatform.et</li>
              <li>Addis Ababa, Ethiopia</li>
              <li>+251 911 000 000</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Ethiopian Rental Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
