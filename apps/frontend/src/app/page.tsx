import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Camera, Car, Home as HomeIcon, Zap, Calendar } from 'lucide-react'; // Add Calendar here

export default function HomePage() {
  const categories = [
    { name: 'Electronics', icon: Camera, count: 234 },
    { name: 'Vehicles', icon: Car, count: 156 },
    { name: 'Furniture', icon: HomeIcon, count: 89 },
    { name: 'Tools', icon: Zap, count: 67 },
  ];

  const featuredListings = [
    {
      id: 1,
      title: 'Professional Camera Sony A7III',
      price: 1500,
      image: null,
      location: 'Addis Ababa',
    },
    {
      id: 2,
      title: 'Mountain Bike - Trek',
      price: 800,
      image: null,
      location: 'Addis Ababa',
    },
    {
      id: 3,
      title: '4-Bedroom House',
      price: 5000,
      image: null,
      location: 'Bole, Addis Ababa',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Login/Register */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Rent Anything, Anywhere in Ethiopia
              </h1>
              <p className="text-xl mb-8 text-white/90">
                From cameras to cars, find what you need from trusted owners
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild className="text-primary">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/3">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Search className="h-8 w-8 text-white" />
                    <h3 className="text-xl font-semibold text-white">Find what you need</h3>
                  </div>
                  <p className="text-white/80">
                    Search thousands of listings across Ethiopia. Easy booking, secure payments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={`/categories/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <category.icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Listings</h2>
            <Button variant="link" asChild>
              <Link href="/search">View All →</Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {listing.image ? (
                      <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <p className="text-gray-400">No image</p>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{listing.title}</h3>
                    <p className="text-primary font-bold">{listing.price} ETB / day</p>
                    <p className="text-sm text-muted-foreground mt-1">{listing.location}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Find what you need</h3>
              <p className="text-muted-foreground">Browse thousands of items available for rent</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Request to book</h3>
              <p className="text-muted-foreground">Choose your dates and send a booking request</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Enjoy your rental</h3>
              <p className="text-muted-foreground">Pick up the item and enjoy your rental experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of happy renters and owners</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Create an Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
