'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Eye, PlusCircle } from 'lucide-react';

export default function ListingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-[500px] text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Listing Created Successfully!</CardTitle>
          <CardDescription>
            Your listing has been submitted and is now pending review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            It will be published once approved by our team. You'll receive a notification when it's live.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {listingId && (
            <Button variant="outline" onClick={() => router.push(`/dashboard/listings/${listingId}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Listing
            </Button>
          )}
          <Button onClick={() => router.push('/dashboard/listings/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Another
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
