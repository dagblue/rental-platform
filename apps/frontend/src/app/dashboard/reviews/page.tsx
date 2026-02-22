'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Mock data - replace with API calls later
  const reviews = [
    {
      id: 1,
      author: 'Abebe Kebede',
      avatar: 'AK',
      date: '2024-02-15',
      rating: 5,
      comment: 'Great experience! The camera was in perfect condition.',
      response: null,
    },
    {
      id: 2,
      author: 'Almaz Worku',
      avatar: 'AW',
      date: '2024-02-10',
      rating: 4,
      comment: 'Good communication, item as described.',
      response: 'Thank you for your kind words!',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        <p className="text-muted-foreground">Manage your reviews and reputation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8/5</div>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Reviews Received</TabsTrigger>
          <TabsTrigger value="given">Reviews Given</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4 space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{review.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{review.author}</h3>
                        <span className="text-sm text-muted-foreground">• {review.date}</span>
                      </div>
                      <div className="flex mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      
                      {review.response ? (
                        <div className="mt-3 pl-4 border-l-2 bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium">Your response:</p>
                          <p className="text-sm text-muted-foreground">{review.response}</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">Respond</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="given" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews You've Given</CardTitle>
              <CardDescription>You haven't written any reviews yet</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Responses</CardTitle>
              <CardDescription>No reviews awaiting your response</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
