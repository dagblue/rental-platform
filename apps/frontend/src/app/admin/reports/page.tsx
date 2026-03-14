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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/lib/api/admin';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Flag,
  MessageSquare,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Report {
  id: string;
  type: 'LISTING' | 'REVIEW' | 'USER';
  targetId: string;
  targetTitle?: string;
  reason: string;
  description?: string;
  reporterId: string;
  reporterName: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'resolve' | 'reject';
    notes?: string;
  }>({ open: false, action: 'resolve' });

  useEffect(() => {
    fetchReports();
  }, [currentPage, typeFilter, statusFilter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getReports({
        page: currentPage,
        limit: 10,
        type: typeFilter || undefined,
      });
      if (response.success) {
        setReports(response.data.items || []);
        setTotalPages(Math.ceil((response.data.total || 0) / 10));
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    
    try {
      const response = await adminApi.resolveReport(
        selectedReport.id,
        actionDialog.action === 'resolve' ? 'RESOLVED' : 'REJECTED',
        actionDialog.notes
      );
      if (response.success) {
        toast.success(`Report ${actionDialog.action === 'resolve' ? 'resolved' : 'rejected'} successfully`);
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to update report');
    } finally {
      setActionDialog({ open: false, action: 'resolve' });
      setSelectedReport(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-gray-100 text-gray-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LISTING':
        return <Package className="h-4 w-4" />;
      case 'REVIEW':
        return <MessageSquare className="h-4 w-4" />;
      case 'USER':
        return <Flag className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report =>
    report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (report.targetTitle && report.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports Management</h1>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={(value: string) => setTypeFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="LISTING">Listings</SelectItem>
                    <SelectItem value="REVIEW">Reviews</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(report.type)}
                            <span>{report.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {report.targetTitle || report.targetId.slice(0, 8)}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <Link href={
                                report.type === 'LISTING' ? `/listings/${report.targetId}` :
                                report.type === 'REVIEW' ? `/listings/${report.targetId}` :
                                `/admin/users`
                              } target="_blank">
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.reason}</p>
                            {report.description && (
                              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(report.status)}>{report.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {report.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionDialog({ open: true, action: 'resolve' });
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionDialog({ open: true, action: 'reject' });
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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
            <div className="flex justify-center items-center gap-2 mt-4">
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
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Resolved reports will appear here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              All reports will appear here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open: boolean) => !open && setActionDialog({ open: false, action: 'resolve' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'resolve' ? 'Resolve Report' : 'Reject Report'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'resolve'
                ? 'This report will be marked as resolved. The reported content has been reviewed.'
                : 'This report will be rejected. No action will be taken on the reported content.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Report Details:</p>
                <p className="text-sm text-muted-foreground">Reason: {selectedReport.reason}</p>
                {selectedReport.description && (
                  <p className="text-sm text-muted-foreground mt-1">Description: {selectedReport.description}</p>
                )}
              </div>
            )}
            <Textarea
              placeholder="Additional notes (optional)"
              value={actionDialog.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setActionDialog({ ...actionDialog, notes: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: 'resolve' })}>
              Cancel
            </Button>
            <Button
              onClick={handleResolveReport}
              variant={actionDialog.action === 'resolve' ? 'default' : 'outline'}
            >
              {actionDialog.action === 'resolve' ? 'Resolve Report' : 'Reject Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
