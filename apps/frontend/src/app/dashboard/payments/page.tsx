'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage your transactions and wallet</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 ETB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 ETB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 ETB</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>No transactions</CardTitle>
              <CardDescription>Your transactions will appear here</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>No withdrawals</CardTitle>
              <CardDescription>Your withdrawal history will appear here</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
