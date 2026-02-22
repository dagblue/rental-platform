'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { listingsApi } from '@/lib/api/listings';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  categoryId: z.string().min(1, 'Category is required'),
  pricePerDay: z.number().min(1, 'Price must be greater than 0'),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  currency: z.enum(['ETB', 'USD']).default('ETB'),
  minimumRentalDays: z.number().min(1).default(1),
  maximumRentalDays: z.number().optional(),
  region: z.string().min(1, 'Region is required'),
  city: z.string().min(1, 'City is required'),
  subcity: z.string().optional(),
  woreda: z.string().min(1, 'Woreda is required'),
  kebele: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.number().min(1900).max(new Date().getFullYear()).optional(),
  rules: z.array(z.string()).optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).default('MODERATE'),
  minTrustLevel: z.enum(['NEW', 'BASIC', 'VERIFIED', 'TRUSTED']).default('BASIC'),
  requiresGuarantor: z.boolean().default(false),
  requiresIdVerification: z.boolean().default(false),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().optional(),
  deliveryAvailable: z.boolean().default(false),
  deliveryFee: z.number().optional(),
  pickupRequired: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateListingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: '',
    description: '',
    categoryId: '',
    pricePerDay: 0,
    pricePerWeek: undefined,
    pricePerMonth: undefined,
    maximumRentalDays: undefined,          
    currency: 'ETB',
    minimumRentalDays: 1,     
    region: '',
    city: '',
    subcity: '',
    woreda: '',
    kebele: '',
    condition: 'GOOD',
    brand: '',
    model: '',
    yearOfManufacture: 1995,   
    rules: [],
    cancellationPolicy: 'MODERATE',
    minTrustLevel: 'BASIC',
    requiresGuarantor: false,
    requiresIdVerification: false,
    requiresDeposit: false,
    depositAmount: 0,          
    deliveryAvailable: false,
    deliveryFee: 0,            
    pickupRequired: true,
  },
});

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await listingsApi.createListing(data);
      if (response.success) {
        toast.success('Listing created successfully');
        router.push(`/dashboard/listings/success?id=${response.data.id}`);
      }
    } catch (error) {
      toast.error('Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Listing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Provide information about your item for rent</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Professional Camera Sony A7III" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cameras">Cameras</SelectItem>
                          <SelectItem value="cars">Cars</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="tools">Tools</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          {...field}
                          value={field.value || ''}
                          onChange={e => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            field.onChange(value);}}
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
                          {...field}
                          value={field.value || ''}
                          onChange={e => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            field.onChange(value);}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADDIS_ABABA">Addis Ababa</SelectItem>
                            <SelectItem value="OROMIA">Oromia</SelectItem>
                            <SelectItem value="AMHARA">Amhara</SelectItem>
                            <SelectItem value="TIGRAY">Tigray</SelectItem>
                            <SelectItem value="SIDAMA">Sidama</SelectItem>
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
                    name="subcity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Bole" {...field} />
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

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Policies & Requirements</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Policy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormDescription>
                              Renter needs a guarantor
                            </FormDescription>
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
                            <FormDescription>
                              Renter must verify ID
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiresDeposit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requires Deposit</FormLabel>
                            <FormDescription>
                              Security deposit required
                            </FormDescription>
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
                            <FormDescription>
                              Offer delivery service
                            </FormDescription>
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
                  {isLoading ? 'Creating...' : 'Create Listing'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
