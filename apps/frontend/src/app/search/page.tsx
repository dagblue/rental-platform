'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listingsApi, Listing } from '@/lib/api/listings';
import { Search, MapPin, Star, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'relevance',
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get search query from URL if present
    const query = searchParams.get('q');
    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.region) params.region = filters.region;
      if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
      if (filters.condition) params.condition = filters.condition;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const response = await listingsApi.searchListings(params);
      if (response.success) {
        setListings(response.data.items || []);
      }
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      region: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sortBy: 'relevance',
    });
    setTimeout(() => fetchListings(), 0);
  };

  const regions = [
    'ADDIS_ABABA',
    'OROMIA',
    'AMHARA',
    'TIGRAY',
    'SIDAMA',
    'HARARI',
    'GAMBELA',
    'BENISHANGUL_GUMUZ',
    'AFAR',
    'SOMALI',
    'SOUTHERN',
  ];

  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for cameras, cars, furniture..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <Button type="submit">Search</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Region</label>
                  <Select 
                    value={filters.region} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>
                          {region.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Condition</label>
                  <Select 
                    value={filters.condition} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any condition</SelectItem>
                      {conditions.map(condition => (
                        <SelectItem key={condition} value={condition}>
                          {condition.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Min Price (ETB)</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Max Price (ETB)</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={fetchListings}>Apply Filters</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isLoading ? 'Searching...' : `${listings.length} listings found`}
          </h2>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, sortBy: value }));
              setTimeout(() => fetchListings(), 0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No listings found matching your criteria</p>
              <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0].url} 
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <p className="text-gray-400">No image</p>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8 (24)</span>
                    </div>
                    <p className="text-primary font-bold">{listing.pricePerDay} ETB <span className="text-sm font-normal text-muted-foreground">/day</span></p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.city}, {listing.region}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {listing.condition}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
