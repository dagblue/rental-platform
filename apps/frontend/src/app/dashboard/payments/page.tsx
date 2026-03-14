'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { paymentsApi, Wallet, Transaction } from '@/lib/api/payments';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PaymentsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    provider: 'CBE_BIRR',
    phoneNumber: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await paymentsApi.getWallet();
      if (response.success) {
        setWallet(response.data);
      }
    } catch (error) {
      toast.error('Failed to load wallet data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await paymentsApi.getTransactions();
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawData.amount) > (wallet?.availableBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await paymentsApi.withdraw({
        amount: parseFloat(withdrawData.amount),
        provider: withdrawData.provider,
        phoneNumber: withdrawData.phoneNumber || undefined,
      });

      if (response.success) {
        toast.success('Withdrawal request submitted');
        setIsWithdrawDialogOpen(false);
        fetchWalletData();
        fetchTransactions();
        setWithdrawData({ amount: '', provider: 'CBE_BIRR', phoneNumber: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
      case 'ESCROW_HOLD':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'REFUND':
      case 'ESCROW_RELEASE':
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage your wallet and transactions</p>
        </div>
        <Button onClick={() => setIsWithdrawDialogOpen(true)} disabled={!wallet?.availableBalance}>
          <WalletIcon className="h-4 w-4 mr-2" />
          Withdraw Funds
        </Button>
      </div>

      {/* Wallet Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(wallet?.availableBalance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Held in Escrow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(wallet?.heldBalance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending release</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All your payment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{tx.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'PAYMENT' || tx.type === 'ESCROW_HOLD' || tx.type === 'WITHDRAWAL'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {tx.type === 'PAYMENT' || tx.type === 'ESCROW_HOLD' || tx.type === 'WITHDRAWAL' ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </p>
                      {getTransactionStatusBadge(tx.status)}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed">
              {transactions.filter(t => t.status === 'COMPLETED').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed transactions
                </div>
              ) : (
                transactions
                  .filter(t => t.status === 'COMPLETED')
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      {/* Same layout as above */}
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="pending">
              {transactions.filter(t => t.status === 'PENDING').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending transactions
                </div>
              ) : (
                transactions
                  .filter(t => t.status === 'PENDING')
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      {/* Same layout as above */}
                    </div>
                  ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw your available balance to your mobile money or bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Available balance: <span className="font-bold">{formatCurrency(wallet?.availableBalance || 0)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                min={1}
                max={wallet?.availableBalance}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Withdrawal Method</Label>
              <Select
                value={withdrawData.provider}
                onValueChange={(value: string) => setWithdrawData({ ...withdrawData, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBE_BIRR">CBE Birr</SelectItem>
                  <SelectItem value="TELEBIRR">Telebirr</SelectItem>
                  <SelectItem value="MPESA">M-PESA</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {withdrawData.provider !== 'BANK_TRANSFER' && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+251 91 234 5678"
                  value={withdrawData.phoneNumber}
                  onChange={(e) => setWithdrawData({ ...withdrawData, phoneNumber: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={fetchWalletData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Balance
          </Button>
          <Button variant="outline" onClick={fetchTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export Transactions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}