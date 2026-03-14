import { apiClient } from './client';

export interface CreateListingData {
  title: string;
  description: string;
  categoryId: string;
  pricePerDay: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  currency: string;
  minimumRentalDays: number;
  maximumRentalDays?: number;
  region: string;
  city: string;
  subcity?: string;
  woreda: string;
  kebele?: string;
  condition: string;
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  rules?: string[];
  cancellationPolicy: string;
  minTrustLevel: string;
  requiresGuarantor: boolean;
  requiresIdVerification: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  pickupRequired: boolean;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  pricePerDay: number;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
  currency: string;
  minimumRentalDays: number;
  maximumRentalDays?: number | null;
  region: string;
  city: string;
  subcity?: string | null;
  woreda: string;
  kebele?: string | null;
  condition: string;
  brand?: string | null;
  model?: string | null;
  yearOfManufacture?: number | null;
  rules: string[];
  cancellationPolicy: string;
  minTrustLevel: string;
  requiresGuarantor: boolean;
  requiresIdVerification: boolean;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  deliveryAvailable: boolean;
  deliveryFee?: number | null;
  pickupRequired: boolean;
  status: string;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export const listingsApi = {
  // Get all listings for the current user
  getMyListings: async (): Promise<{ success: boolean; data: Listing[] }> => {
    const response = await apiClient.get('/listings/user/me');
    return response.data;
  },

  // Get a single listing by ID
  getListingById: async (id: string): Promise<{ success: boolean; data: Listing }> => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  // Create a new listing
  createListing: async (data: CreateListingData): Promise<{ success: boolean; data: Listing }> => {
    const response = await apiClient.post('/listings', data);
    return response.data;
  },

  // Update a listing
  updateListing: async (id: string, data: Partial<CreateListingData>): Promise<{ success: boolean; data: Listing }> => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data;
  },

  // Delete a listing
  deleteListing: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  },

  // Search listings
  searchListings: async (params?: any): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get('/listings/search', { params });
    return response.data;
  },

  // Upload listing image
  uploadImage: async (listingId: string, file: File): Promise<{ success: boolean; data: ListingImage }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/listings/${listingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete listing image
  deleteImage: async (listingId: string, imageId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/listings/${listingId}/images/${imageId}`);
    return response.data;
  },
};