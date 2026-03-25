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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { listingsApi, Listing } from '@/lib/api/listings';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  X, 
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

// Ethiopian regions
const ETHIOPIAN_REGIONS = [
  'ADDIS_ABABA',
  'AFAR',
  'AMHARA',
  'BENISHANGUL_GUMUZ',
  'DIRE_DAWA',
  'GAMBELA',
  'HARARI',
  'OROMIA',
  'SIDAMA',
  'SOMALI',
  'SOUTH_WEST',
  'TIGRAY',
  'SOUTHERN'
];

// Categories
const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', count: 234 },
  { id: 'vehicles', name: 'Vehicles', count: 156 },
  { id: 'furniture', name: 'Furniture', count: 89 },
  { id: 'tools', name: 'Tools', count: 67 },
  { id: 'cameras', name: 'Cameras', count: 45 },
  { id: 'clothing', name: 'Clothing', count: 78 },
  { id: 'books', name: 'Books', count: 34 },
  { id: 'sports', name: 'Sports', count: 56 },
];

// Conditions
const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

// Sort options
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

export default function SearchContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search params
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    minTrustLevel: '',
    deliveryAvailable: false,
    instantBooking: false,
  });
  const [sortBy, setSortBy] = useState('relevance');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [debouncedSearch, filters, sortBy, currentPage]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sortBy: sortBy === 'price_asc' ? 'price' : 
                sortBy === 'price_desc' ? 'price' : 
                sortBy === 'newest' ? 'createdAt' : 
                sortBy === 'rating' ? 'rating' : 'relevance',
        sortOrder: sortBy === 'price_asc' ? 'asc' : 
                  sortBy === 'price_desc' ? 'desc' : 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.region) params.region = filters.region;
      if (filters.category) params.categoryId = filters.category;
      if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
      if (filters.condition) params.condition = filters.condition;
      if (filters.minTrustLevel) params.minTrustLevel = filters.minTrustLevel;
      if (filters.deliveryAvailable) params.deliveryAvailable = true;
      if (filters.instantBooking) params.instantBooking = true;

      const response = await listingsApi.searchListings(params);
      if (response.success) {
        setListings(response.data.items || []);
        setTotalResults(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      minTrustLevel: '',
      deliveryAvailable: false,
      instantBooking: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '' && value !== false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={filters.category === cat.id}
                  onCheckedChange={(checked: boolean) => {
                    setFilters({ ...filters, category: checked ? cat.id : '' });
                    setCurrentPage(1);
                  }}
                />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                  {cat.name}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Region */}
      <div>
        <h3 className="font-semibold mb-3">Region</h3>
        <Select 
          value={filters.region || "all"} 
          onValueChange={(value: string) => {
            setFilters({ ...filters, region: value === "all" ? "" : value });
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {ETHIOPIAN_REGIONS.map((region: string) => (
              <SelectItem key={region} value={region}>
                {region.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range (ETB/day)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFilters({ ...filters, minPrice: e.target.value });
              setCurrentPage(1);
            }}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFilters({ ...filters, maxPrice: e.target.value });
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Separator />

      {/* Condition */}
      <div>
        <h3 className="font-semibold mb-3">Condition</h3>
        <Select 
          value={filters.condition || "all"} 
          onValueChange={(value: string) => {
            setFilters({ ...filters, condition: value === "all" ? "" : value });
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any condition</SelectItem>
            {CONDITIONS.map((condition: string) => (
              <SelectItem key={condition} value={condition}>
                {condition.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Additional Filters */}
      <div>
        <h3 className="font-semibold mb-3">More Filters</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery"
              checked={filters.deliveryAvailable}
              onCheckedChange={(checked: boolean) => {
                setFilters({ ...filters, deliveryAvailable: checked });
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="delivery" className="text-sm cursor-pointer">
              Delivery Available
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="instant"
              checked={filters.instantBooking}
              onCheckedChange={(checked: boolean) => {
                setFilters({ ...filters, instantBooking: checked });
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="instant" className="text-sm cursor-pointer">
              Instant Booking
            </Label>
          </div>
        </div>
      </div>

      {hasActiveFilters() && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Search Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for cameras, cars, furniture..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters() && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {Object.values(filters).filter(v => v !== '' && v !== false).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold">Filters</h2>
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {isLoading ? 'Searching...' : `${totalResults} listings found`}
                </h2>
                {searchQuery && (
                  <p className="text-muted-foreground">
                    for "{searchQuery}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option: { value: string; label: string }) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-r-none ${viewMode === 'grid' ? 'bg-accent' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-l-none ${viewMode === 'list' ? 'bg-accent' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.region && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Region: {filters.region.replace('_', ' ')}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, region: '' });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {CATEGORIES.find(c => c.id === filters.category)?.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, category: '' });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
                {filters.condition && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Condition: {filters.condition.replace('_', ' ')}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, condition: '' });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'} ETB
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, minPrice: '', maxPrice: '' });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
                {filters.deliveryAvailable && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Delivery Available
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, deliveryAvailable: false });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
                {filters.instantBooking && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Instant Booking
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      setFilters({ ...filters, instantBooking: false });
                      setCurrentPage(1);
                    }} />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid/List */}
            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className={viewMode === 'grid' ? 'h-64' : 'h-32'} />
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
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {listings.map((listing: Listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className={`hover:shadow-lg transition-shadow h-full ${viewMode === 'list' ? 'flex' : ''}`}>
                      {viewMode === 'grid' ? (
                        <>
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
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">4.8</span>
                              </div>
                            </div>
                            <p className="text-primary font-bold">{listing.pricePerDay} ETB <span className="text-sm font-normal text-muted-foreground">/day</span></p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.city}, {listing.region?.replace('_', ' ')}</span>
                            </div>
                            <Badge variant="outline" className="mt-2">
                              {listing.condition?.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        </>
                      ) : (
                        <div className="flex w-full">
                          <div className="w-48 h-48 bg-gray-100 rounded-l-lg flex-shrink-0">
                            {listing.images && listing.images.length > 0 ? (
                              <img 
                                src={listing.images[0].url} 
                                alt={listing.title}
                                className="w-full h-full object-cover rounded-l-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{listing.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star: number) => (
                                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">(24 reviews)</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                  {listing.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {listing.city}
                                  </span>
                                  <Badge variant="outline">{listing.condition?.replace('_', ' ')}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{listing.pricePerDay} ETB</p>
                                <p className="text-sm text-muted-foreground">per day</p>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
