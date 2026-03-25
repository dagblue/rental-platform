'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { listingsApi } from '@/lib/api/listings';
import { ArrowLeft, Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  categoryId: z.string().min(1),
  pricePerDay: z.number().min(1),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  currency: z.enum(['ETB', 'USD']),
  minimumRentalDays: z.number().min(1),
  maximumRentalDays: z.number().optional(),
  region: z.string().min(1),
  city: z.string().min(1),
  subcity: z.string().optional(),
  woreda: z.string().min(1),
  kebele: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.number().optional(),
  rules: z.array(z.string()).optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']),
  minTrustLevel: z.enum(['NEW', 'BASIC', 'VERIFIED', 'TRUSTED']),
  requiresGuarantor: z.boolean(),
  requiresIdVerification: z.boolean(),
  requiresDeposit: z.boolean(),
  depositAmount: z.number().optional(),
  deliveryAvailable: z.boolean(),
  deliveryFee: z.number().optional(),
  pickupRequired: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditListingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      pricePerDay: 0,
      pricePerWeek: undefined,
      pricePerMonth: undefined,
      currency: 'ETB',
      minimumRentalDays: 1,
      maximumRentalDays: undefined,
      region: '',
      city: '',
      subcity: '',
      woreda: '',
      kebele: '',
      condition: 'GOOD',
      brand: '',
      model: '',
      yearOfManufacture: undefined,
      rules: [],
      cancellationPolicy: 'MODERATE',
      minTrustLevel: 'BASIC',
      requiresGuarantor: false,
      requiresIdVerification: false,
      requiresDeposit: false,
      depositAmount: undefined,
      deliveryAvailable: false,
      deliveryFee: undefined,
      pickupRequired: true,
    },
  });

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await listingsApi.getListingById(listingId);
      if (response.success) {
        // Cast the response data to FormValues (they are compatible)
        const listingData = response.data as unknown as FormValues;
        form.reset(listingData);
      }
    } catch (error) {
      toast.error('Failed to load listing');
      router.push('/dashboard/listings');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await listingsApi.updateListing(listingId, data);
      if (response.success) {
        toast.success('Listing updated successfully');
        router.push('/dashboard/listings');
      }
    } catch (error) {
      toast.error('Failed to update listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} type="button">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Listing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Update your listing information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Professional Camera Sony A7III" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your item, condition, features, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="vehicles">Vehicles</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="tools">Tools</SelectItem>
                          <SelectItem value="cameras">Cameras</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="LIKE_NEW">Like New</SelectItem>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="POOR">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Day (ETB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumRentalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Rental Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADDIS_ABABA">Addis Ababa</SelectItem>
                            <SelectItem value="OROMIA">Oromia</SelectItem>
                            <SelectItem value="AMHARA">Amhara</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Addis Ababa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="woreda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Woreda</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 03" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Policies Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Policies & Requirements</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Policy</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                            <SelectItem value="MODERATE">Moderate</SelectItem>
                            <SelectItem value="STRICT">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requiresGuarantor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requires Guarantor</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiresIdVerification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requires ID Verification</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Delivery Available</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <CardFooter className="px-0 flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Listing'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
