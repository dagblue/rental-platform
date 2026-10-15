'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { listingsApi, Listing } from '@/lib/api/listings';
import { Search, SlidersHorizontal, MapPin, Grid, List, Star, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Electronics','Vehicles','Furniture','Tools','Cameras','Sports','Clothing','Books'];
const CONDITIONS  = ['NEW','LIKE_NEW','GOOD','FAIR','POOR'];
const REGIONS     = ['ADDIS_ABABA','OROMIA','AMHARA','TIGRAY','SIDAMA','DIRE_DAWA','AFAR','SOMALI'];

function imgSrc(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    region: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  });

  const debouncedQ = useDebounce(q, 450);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQ, filters, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 12 };
      if (debouncedQ) params.search = debouncedQ;
      if (filters.category) params.categoryId = filters.category.toLowerCase();
      if (filters.region) params.region = filters.region;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.condition) params.condition = filters.condition;
      const res = await listingsApi.searchListings(params);
      if (!res.success) throw new Error('Search failed');
      return res.data;
    },
  });

  const listings: Listing[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const clearFilters = () => {
    setFilters({ category: '', region: '', minPrice: '', maxPrice: '', condition: '' });
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-primary font-semibold hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Category</p>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                checked={filters.category.toLowerCase() === cat.toLowerCase()}
                onChange={e => { setFilters(f => ({ ...f, category: e.target.checked ? cat : '' })); setPage(1); }}
                className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Price / Day (ETB)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setPage(1); }}
            className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setPage(1); }}
            className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Condition</p>
        <div className="space-y-2">
          {CONDITIONS.map(c => (
            <label key={c} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-primary">
              <input
                type="checkbox"
                checked={filters.condition === c}
                onChange={e => { setFilters(f => ({ ...f, condition: e.target.checked ? c : '' })); setPage(1); }}
                className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
              />
              {c.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Region</p>
        <select
          value={filters.region}
          onChange={e => { setFilters(f => ({ ...f, region: e.target.value })); setPage(1); }}
          className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="font-black text-xl text-primary hidden md:block shrink-0">
            Rental Platform
          </Link>
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              placeholder="Search cameras, cars, tools..."
              className="w-full pl-11 pr-4 h-10 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
          <button
            className="flex items-center gap-2 text-sm font-semibold border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition-colors md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">!</span>}
          </button>
        </div>
      </header>

      {/* Mobile filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 overflow-y-auto md:hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
          </div>
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-white rounded-xl border p-5 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                {isLoading ? 'Searching…' : `${total} listing${total !== 1 ? 's' : ''} found`}
                {debouncedQ && <span className="text-slate-400 font-normal"> for &ldquo;{debouncedQ}&rdquo;</span>}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  {(['grid','list'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={cn('p-1.5 rounded-md transition-all', view === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600')}
                    >
                      {v === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([k, v]) => v ? (
                  <span key={k} className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {v.replace(/_/g, ' ')}
                    <button onClick={() => { setFilters(f => ({ ...f, [k]: '' })); setPage(1); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null)}
              </div>
            )}

            {isError ? (
              <div className="py-20 text-center bg-white rounded-xl border">
                <p className="text-slate-500 mb-4">Couldn&apos;t load results. Try again.</p>
                <button onClick={() => window.location.reload()} className="text-sm text-primary font-semibold hover:underline">Retry</button>
              </div>
            ) : isLoading ? (
              <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className={cn('w-full rounded-xl', view === 'grid' ? 'h-48' : 'h-36')} />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-dashed">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">No listings found</h3>
                <p className="text-slate-500 text-sm mb-4">Try adjusting your filters or search terms</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {listings.map(listing => {
                  const src = imgSrc(listing.images?.[0]?.url);
                  const rating = listing.owner?.averageRating;
                  const rc = listing.owner?.reviewCount || 0;
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className={cn(
                        'group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300',
                        view === 'list' ? 'flex h-40' : ''
                      )}
                    >
                      <div className={cn('relative overflow-hidden bg-slate-100', view === 'list' ? 'w-48 h-full shrink-0' : 'h-48')}>
                        {src ? (
                          <Image
                            src={src}
                            alt={listing.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-200" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-bold bg-white/90 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                            {listing.categoryId}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                              {listing.title}
                            </h3>
                            {rc > 0 && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold">{rating?.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {listing.city}
                          </p>
                          {view === 'list' && listing.description && (
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{listing.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t pt-3 mt-3">
                          <div>
                            <span className="text-lg font-black text-primary">ETB {listing.pricePerDay}</span>
                            <span className="text-xs text-slate-400 ml-1">/day</span>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {listing.condition?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-slate-700 px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
