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
import { adminApi, AdminUser } from '@/lib/api/admin';
import { Search, ChevronLeft, ChevronRight, MoreVertical, Shield, Ban, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'status' | 'role';
    value: string;
    reason?: string;
  }>({ open: false, type: 'status', value: '' });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: 10,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setUsers(response.data.items);
        setTotalPages(Math.ceil(response.data.total / 10));
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminApi.updateUserStatus(
        selectedUser.id,
        actionDialog.value,
        actionDialog.reason
      );
      if (response.success) {
        toast.success(`User status updated to ${actionDialog.value}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionDialog({ open: false, type: 'status', value: '' });
      setSelectedUser(null);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminApi.updateUserRole(selectedUser.id, actionDialog.value);
      if (response.success) {
        toast.success(`User role updated to ${actionDialog.value}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setActionDialog({ open: false, type: 'role', value: '' });
      setSelectedUser(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      BANNED: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      MODERATOR: 'bg-blue-100 text-blue-800',
      SUPPORT: 'bg-green-100 text-green-800',
      OWNER: 'bg-orange-100 text-orange-800',
      RENTER: 'bg-gray-100 text-gray-800',
    };
    return variants[role] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="SUPPORT">Support</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="RENTER">Renter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trust Level</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.trustLevel}</TableCell>
                    <TableCell>{user.listingsCount}</TableCell>
                    <TableCell>{user.bookingsCount}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog({ open: true, type: 'status', value: user.status });
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Change Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog({ open: true, type: 'role', value: user.role });
                            }}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open: any) => !open && setActionDialog({ open: false, type: 'status', value: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'status' ? 'Change User Status' : 'Change User Role'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'status'
                ? 'Update the user account status. Suspended users cannot log in.'
                : 'Change the user role to grant different permissions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionDialog.type === 'status' ? (
              <>
                <Select
                  value={actionDialog.value}
                  onValueChange={(value: string) => setActionDialog({ ...actionDialog, value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="BANNED">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Reason for status change (optional)"
                  value={actionDialog.reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setActionDialog({ ...actionDialog, reason: e.target.value })
                  }
                />
              </>
            ) : (
              <Select
                value={actionDialog.value}
                onValueChange={(value: string) => setActionDialog({ ...actionDialog, value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="RENTER">Renter</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: 'status', value: '' })}>
              Cancel
            </Button>
            <Button onClick={actionDialog.type === 'status' ? handleStatusChange : handleRoleChange}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}