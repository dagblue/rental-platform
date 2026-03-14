'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { adminApi, AdminReview } from '@/lib/api/admin';
import { Search, ChevronLeft, ChevronRight, Eye, Trash2, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    reason?: string;
  }>({ open: false });

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getReviews({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setReviews(response.data.items);
        setTotalPages(Math.ceil(response.data.total / 10));
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveReview = async () => {
    if (!selectedReview) return;
    
    try {
      const response = await adminApi.removeReview(
        selectedReview.id,
        actionDialog.reason || 'Violates platform guidelines'
      );
      if (response.success) {
        toast.success('Review removed successfully');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to remove review');
    } finally {
      setActionDialog({ open: false });
      setSelectedReview(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      FLAGGED: 'bg-yellow-100 text-yellow-800',
      REMOVED: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review =>
    review.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews Moderation</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="FLAGGED">Flagged</SelectItem>
                <SelectItem value="REMOVED">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.reviewerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {review.targetType === 'USER' ? 'User' : 'Listing'}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate">{review.comment}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(review.status)}>{review.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {review.reportsCount > 0 ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertCircle className="h-4 w-4" />
                          {review.reportsCount}
                        </span>
                      ) : (
                        '0'
                      )}
                    </TableCell>
                    <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/listings/${review.targetId}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {review.status !== 'REMOVED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedReview(review);
                              setActionDialog({ open: true });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
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

      {/* Remove Review Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open: boolean) => !open && setActionDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Review</DialogTitle>
            <DialogDescription>
              This review will be removed from the platform. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReview && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Review:</p>
                <p className="text-sm text-muted-foreground">"{selectedReview.comment}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Rating: {selectedReview.rating}/5
                </p>
              </div>
            )}
            <Textarea
              placeholder="Reason for removal (optional)"
              value={actionDialog.reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setActionDialog({ ...actionDialog, reason: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveReview}>
              Remove Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
