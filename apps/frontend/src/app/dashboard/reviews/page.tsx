'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi, Review } from '@/lib/api/reviews';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    responseRate: 0,
    helpfulVotes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getUserReviews();
      if (response.success) {
        setReviews(response.data.items);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // For now, calculate stats from reviews
      // Later you can have a dedicated stats endpoint
      const response = await reviewsApi.getUserReviews();
      if (response.success && response.data.items.length > 0) {
        const total = response.data.items.reduce((sum, r) => sum + r.rating, 0);
        const avg = total / response.data.items.length;
        const helpful = response.data.items.reduce((sum, r) => sum + r.helpful, 0);

        setStats({
          averageRating: avg,
          totalReviews: response.data.items.length,
          responseRate: 95, // Placeholder - calculate from actual responses
          helpfulVotes: helpful,
        });
      }
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const receivedReviews = reviews.filter((r) => r.revieweeId);
  const givenReviews = reviews.filter((r) => r.reviewerId);
  const pendingResponses = receivedReviews.filter((r) => !r.response);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
          <p className="text-muted-foreground">Manage your reviews and reputation</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</div>
            <div className="flex mt-1">{renderStars(Math.round(stats.averageRating))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Across your listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">Responds within 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.helpfulVotes}</div>
            <p className="text-xs text-muted-foreground">Received from users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">Reviews Received ({receivedReviews.length})</TabsTrigger>
          <TabsTrigger value="given">Reviews Given ({givenReviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Response ({pendingResponses.length})</TabsTrigger>
        </TabsList>

        {/* Reviews Received Tab */}
        <TabsContent value="received" className="mt-4 space-y-4">
          {receivedReviews.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No reviews yet</CardTitle>
                <CardDescription>
                  When users review your listings, they'll appear here
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            receivedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{review.reviewerName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{review.reviewerName}</h3>
                          {review.verified && (
                            <Badge variant="outline" className="text-green-600">
                              Verified Booking
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-sm mt-2 mb-3">{review.comment}</p>

                        {review.response ? (
                          <div className="mt-3 pl-4 border-l-2 bg-gray-50 p-3 rounded">
                            <p className="text-xs font-medium mb-1">Your response:</p>
                            <p className="text-sm">{review.response.comment}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(review.response.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              // Open response dialog
                              toast.info('Response feature coming soon');
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-1">
                      <Button variant="ghost" size="icon">
                        <Star className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">{review.helpful}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reviews Given Tab */}
        <TabsContent value="given" className="mt-4 space-y-4">
          {givenReviews.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No reviews given yet</CardTitle>
                <CardDescription>
                  After you complete a booking, you can leave a review
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            givenReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>{review.revieweeName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{review.revieweeName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      <p className="text-sm mt-2">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Pending Response Tab */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingResponses.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No pending responses</CardTitle>
                <CardDescription>You've responded to all your reviews</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            pendingResponses.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{review.reviewerName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.reviewerName}</h3>
                        {renderStars(review.rating)}
                        <p className="text-sm mt-2">{review.comment}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        toast.info(`Response to ${review.reviewerName} - coming soon`);
                      }}
                    >
                      Respond Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
