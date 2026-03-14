'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { reviewsApi, Review, ReviewStats } from '@/lib/api/reviews';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle, 
  Flag,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    pros: [''],
    cons: [''],
    isAnonymous: false,
  });

  const router = useRouter();

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [page]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await reviewsApi.getUserReviews({ page, limit: 5 });
      if (response.success) {
        setReviews(response.data.items);
        setTotalPages(Math.ceil(response.data.total / 5));
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get stats for the current user (you'll need to pass user ID)
      // For now, we'll skip or use a placeholder
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await reviewsApi.markHelpful(reviewId);
      if (response.success) {
        toast.success('Marked as helpful');
        fetchReviews(); // Refresh to update count
      }
    } catch (error) {
      toast.error('Failed to mark as helpful');
    }
  };

  const handleAddResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      const response = await reviewsApi.addResponse(selectedReview.id, responseText);
      if (response.success) {
        toast.success('Response added');
        setIsResponseDialogOpen(false);
        setResponseText('');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await reviewsApi.deleteReview(reviewId);
      if (response.success) {
        toast.success('Review deleted');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleCreateReview = async () => {
    try {
      // This would need a booking ID and target ID
      // For now, we'll just show a placeholder
      toast.info('Review creation will be available after completed bookings');
      setIsWriteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading && page === 1) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
          <p className="text-muted-foreground">Manage your reviews and reputation</p>
        </div>
        <Button onClick={() => setIsWriteDialogOpen(true)}>
          Write a Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <div className="flex mt-1">
              {renderStars(4.8)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across 12 listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Responds within 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Received from users</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <Progress value={rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground w-12">
                  {rating === 5 ? '60%' : rating === 4 ? '25%' : rating === 3 ? '10%' : rating === 2 ? '3%' : '2%'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different review views */}
      <Tabs defaultValue="received">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
          <TabsTrigger value="given">Reviews Given</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
        </TabsList>

        {/* Reviews Received Tab */}
        <TabsContent value="received" className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No reviews yet</CardTitle>
                <CardDescription>
                  When users review your listings, they'll appear here
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.reviewerName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{review.reviewerName}</h3>
                            {review.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <Badge variant="outline">
                              {review.targetType === 'LISTING' ? 'Listing' : 'User'}
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{review.comment}</p>
                          
                          {/* Pros and Cons */}
                          {(review.pros?.length > 0 || review.cons?.length > 0) && (
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              {review.pros?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
                                  <ul className="list-disc list-inside text-xs text-muted-foreground">
                                    {review.pros.map((pro, idx) => (
                                      <li key={idx}>{pro}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.cons?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-red-600 mb-1">Cons</p>
                                  <ul className="list-disc list-inside text-xs text-muted-foreground">
                                    {review.cons.map((con, idx) => (
                                      <li key={idx}>{con}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Review Images */}
                          {review.images?.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.slice(0, 3).map((img, idx) => (
                                <div key={idx} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                  <img src={img} alt="Review" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Owner Response */}
                          {review.response ? (
                            <div className="mt-3 pl-4 border-l-2 bg-gray-50 p-3 rounded">
                              <p className="text-xs font-medium mb-1">Your response:</p>
                              <p className="text-sm">{review.response.comment}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(review.response.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedReview(review);
                                setIsResponseDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkHelpful(review.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{review.helpful}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm py-2 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Reviews Given Tab */}
        <TabsContent value="given" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews You've Written</CardTitle>
              <CardDescription>
                You haven't written any reviews yet. Reviews will appear here after completed bookings.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Pending Response Tab */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Awaiting Response</CardTitle>
              <CardDescription>
                No reviews awaiting your response.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a public response to this review. Be professional and courteous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-1">Original review:</p>
                <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
              </div>
            )}
            <Textarea
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResponse} disabled={!responseText.trim()}>
              Post Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Review Dialog */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience to help others in the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= newReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Review</Label>
              <Textarea
                id="comment"
                placeholder="Tell others about your experience..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Pros (Optional)</Label>
              {newReview.pros.map((pro, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={pro}
                    onChange={(e) => {
                      const updated = [...newReview.pros];
                      updated[index] = e.target.value;
                      setNewReview({ ...newReview, pros: updated });
                    }}
                    placeholder="e.g. Great condition"
                  />
                  {index === newReview.pros.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewReview({ ...newReview, pros: [...newReview.pros, ''] })}
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Cons (Optional)</Label>
              {newReview.cons.map((con, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={con}
                    onChange={(e) => {
                      const updated = [...newReview.cons];
                      updated[index] = e.target.value;
                      setNewReview({ ...newReview, cons: updated });
                    }}
                    placeholder="e.g. Slightly expensive"
                  />
                  {index === newReview.cons.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewReview({ ...newReview, cons: [...newReview.cons, ''] })}
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={newReview.isAnonymous}
                onCheckedChange={(checked: boolean) => 
                  setNewReview({ ...newReview, isAnonymous: checked })
                }
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWriteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}