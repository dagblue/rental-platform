'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi, Review } from '@/lib/api/reviews';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Respond dialog state
  const [respondingTo, setRespondingTo] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // getUserReviews returns reviews written BY the current user
      // To get reviews received, we need to fetch by the user's own ID as targetId
      const [writtenRes, receivedRes] = await Promise.allSettled([
        reviewsApi.getUserReviews(),
        user?.id ? reviewsApi.getReviews(user.id) : Promise.resolve(null),
      ]);

      const written =
        writtenRes.status === 'fulfilled' && writtenRes.value.success
          ? writtenRes.value.data.items
          : [];

      const received =
        receivedRes.status === 'fulfilled' &&
        receivedRes.value &&
        receivedRes.value.success
          ? receivedRes.value.data.items
          : [];

      // Merge, deduplicate by id
      const merged = [...received, ...written.filter((w) => !received.find((r) => r.id === w.id))];
      setReviews(merged);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!respondingTo || !responseText.trim()) return;
    setIsSubmittingResponse(true);
    try {
      const res = await reviewsApi.addResponse(respondingTo.id, responseText.trim());
      if (res.success) {
        toast.success('Response posted');
        setRespondingTo(null);
        setResponseText('');
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Split: reviews where current user is reviewer = given, where they're the target = received
  const receivedReviews = reviews.filter(
    (r) => r.targetId === user?.id || (r.targetType === 'USER' && r.reviewerId !== user?.id)
  );
  const givenReviews = reviews.filter((r) => r.reviewerId === user?.id);
  const pendingResponses = receivedReviews.filter((r) => !r.response);

  const avgRating =
    receivedReviews.length > 0
      ? receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length
      : 0;
  const totalHelpful = receivedReviews.reduce((s, r) => s + (r.helpful || 0), 0);

  const ReviewCard = ({ review, isOwn }: { review: Review; isOwn: boolean }) => (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {review.reviewerName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{review.reviewerName || 'Anonymous'}</span>
                {review.verified && (
                  <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 h-4 px-1">
                    Verified
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-sm mt-2 mb-3 text-foreground/80 leading-relaxed">
              {review.comment}
            </p>

            {/* Response thread */}
            {review.response && (
              <div className="mt-3 pl-3 border-l-2 border-primary/30 bg-muted/40 rounded-r-lg p-3">
                <p className="text-xs font-semibold text-primary mb-1">Your response</p>
                <p className="text-sm text-foreground/80">{review.response.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(review.response.createdAt), { addSuffix: true })}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              {!isOwn && !review.response && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => {
                    setRespondingTo(review);
                    setResponseText('');
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Respond
                </Button>
              )}
              <span className="text-xs text-muted-foreground">
                {review.helpful} helpful
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your reputation and respond to reviews
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Average Rating',
            value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : '—',
            sub: <StarRating rating={Math.round(avgRating)} />,
          },
          {
            label: 'Total Reviews',
            value: receivedReviews.length.toString(),
            sub: <span className="text-xs text-muted-foreground">Received</span>,
          },
          {
            label: 'Pending Response',
            value: pendingResponses.length.toString(),
            sub: <span className="text-xs text-muted-foreground">Awaiting reply</span>,
          },
          {
            label: 'Helpful Votes',
            value: totalHelpful.toString(),
            sub: <span className="text-xs text-muted-foreground">Across reviews</span>,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-bold mb-1">{stat.value}</p>
              {stat.sub}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">
            Received ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Given ({givenReviews.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingResponses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4 space-y-3">
          {receivedReviews.length === 0 ? (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">No reviews received yet</CardTitle>
                <CardDescription>
                  Reviews from renters will appear here after completed bookings
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            receivedReviews.map((r) => (
              <ReviewCard key={r.id} review={r} isOwn={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="given" className="mt-4 space-y-3">
          {givenReviews.length === 0 ? (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">No reviews given yet</CardTitle>
                <CardDescription>
                  After completing a booking you can leave a review
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            givenReviews.map((r) => (
              <ReviewCard key={r.id} review={r} isOwn={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingResponses.length === 0 ? (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">All caught up</CardTitle>
                <CardDescription>
                  You've responded to all your reviews
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            pendingResponses.map((r) => (
              <ReviewCard key={r.id} review={r} isOwn={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Respond dialog */}
      <Dialog
        open={!!respondingTo}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setRespondingTo(null);
            setResponseText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to review</DialogTitle>
            <DialogDescription>
              Your response will be visible publicly alongside the review.
            </DialogDescription>
          </DialogHeader>
          {respondingTo && (
            <div className="bg-muted/50 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={respondingTo.rating} />
                <span className="text-xs text-muted-foreground">
                  by {respondingTo.reviewerName}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{respondingTo.comment}</p>
            </div>
          )}
          <Textarea
            placeholder="Write a professional, helpful response..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRespondingTo(null);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || isSubmittingResponse}
            >
              {isSubmittingResponse ? 'Posting…' : 'Post response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
