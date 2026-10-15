'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { paymentsApi, Wallet, Transaction } from '@/lib/api/payments';
import {
  Wallet as WalletIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isDebit(type: string) {
  return ['PAYMENT', 'ESCROW_HOLD', 'WITHDRAWAL'].includes(type);
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const debit = isDebit(tx.type);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${debit ? 'bg-red-50' : 'bg-green-50'}`}>
          {debit
            ? <ArrowUpRight className="h-4 w-4 text-red-500" />
            : <ArrowDownLeft className="h-4 w-4 text-green-500" />}
        </div>
        <div>
          <p className="text-sm font-medium leading-tight">{tx.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
            {tx.provider && ` · ${tx.provider}`}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${debit ? 'text-red-600' : 'text-green-600'}`}>
          {debit ? '−' : '+'}{formatCurrency(tx.amount)}
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] h-4 px-1 mt-0.5 ${
            tx.status === 'COMPLETED'
              ? 'border-green-200 text-green-700'
              : tx.status === 'PENDING'
              ? 'border-amber-200 text-amber-700'
              : 'border-red-200 text-red-700'
          }`}
        >
          {tx.status}
        </Badge>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    provider: 'CBE_BIRR',
    phoneNumber: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [walletRes, txRes] = await Promise.allSettled([
        paymentsApi.getWallet(),
        paymentsApi.getTransactions(),
      ]);
      if (walletRes.status === 'fulfilled' && walletRes.value.success) {
        setWallet(walletRes.value.data);
      }
      if (txRes.status === 'fulfilled' && txRes.value.success) {
        setTransactions(txRes.value.data);
      }
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
    toast.success('Balance refreshed');
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawData.amount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > (wallet?.availableBalance || 0)) {
      toast.error('Insufficient available balance');
      return;
    }
    if (
      withdrawData.provider !== 'BANK_TRANSFER' &&
      !withdrawData.phoneNumber.trim()
    ) {
      toast.error('Phone number is required for mobile money');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await paymentsApi.withdraw({
        amount,
        provider: withdrawData.provider,
        phoneNumber: withdrawData.phoneNumber || undefined,
      });
      if (res.success) {
        toast.success('Withdrawal request submitted');
        setWithdrawOpen(false);
        setWithdrawData({ amount: '', provider: 'CBE_BIRR', phoneNumber: '' });
        loadAll();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const completed = transactions.filter((t) => t.status === 'COMPLETED');
  const pending = transactions.filter((t) => t.status === 'PENDING');

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Wallet, earnings, and transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setWithdrawOpen(true)}
            disabled={!wallet?.availableBalance || wallet.availableBalance <= 0}
          >
            <WalletIcon className="h-3.5 w-3.5 mr-1.5" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-green-200/60 bg-green-50/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <WalletIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(wallet?.availableBalance || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-700">
              {formatCurrency(wallet?.heldBalance || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Held in escrow</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-border/60">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription className="text-xs">All payment activity on your account</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          <Tabs defaultValue="all">
            <div className="px-6 pb-3 border-b border-border/60">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7">
                  All ({transactions.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs h-7">
                  Completed ({completed.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs h-7">
                  Pending ({pending.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {[
              { key: 'all', items: transactions },
              { key: 'completed', items: completed },
              { key: 'pending', items: pending },
            ].map(({ key, items }) => (
              <TabsContent key={key} value={key} className="mt-0">
                {items.length === 0 ? (
                  <div className="py-12 text-center">
                    <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No {key !== 'all' ? key : ''} transactions yet</p>
                  </div>
                ) : (
                  items.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw funds</DialogTitle>
            <DialogDescription>
              Transfer your available balance to your mobile money or bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
              <p className="text-sm">
                Available:{' '}
                <span className="font-bold text-primary">
                  {formatCurrency(wallet?.availableBalance || 0)}
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 500"
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                min={1}
                max={wallet?.availableBalance}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-sm">Withdrawal method</Label>
              <Select
                value={withdrawData.provider}
                onValueChange={(v: string) => setWithdrawData({ ...withdrawData, provider: v })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
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
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm">Phone number</Label>
                <Input
                  id="phone"
                  placeholder="+251 91 234 5678"
                  value={withdrawData.phoneNumber}
                  onChange={(e) =>
                    setWithdrawData({ ...withdrawData, phoneNumber: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing…
                </span>
              ) : (
                'Withdraw'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
