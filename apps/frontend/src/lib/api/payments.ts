import { apiClient } from './client';

export interface Wallet {
  balance: number;
  heldBalance: number;
  availableBalance: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'PAYMENT' | 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  provider: string;
  reference: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  provider: 'CBE_BIRR' | 'TELEBIRR' | 'MPESA' | 'BANK_TRANSFER' | 'CARD';
  phoneNumber?: string;
}

export interface EscrowStatus {
  bookingId: string;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  releasedTo: 'OWNER' | 'RENTER' | null;
  releasedAt: string | null;
  createdAt: string;
}

export const paymentsApi = {
  // Get wallet balance
  getWallet: async (): Promise<{ success: boolean; data: Wallet }> => {
    const response = await apiClient.get('/payments/wallet');
    return response.data;
  },

  // Get transaction history
  getTransactions: async (): Promise<{ success: boolean; data: Transaction[] }> => {
    const response = await apiClient.get('/payments/transactions');
    return response.data;
  },

  // Process a payment
  processPayment: async (data: PaymentRequest): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post('/payments/process', data);
    return response.data;
  },

  // Release escrow (for owners)
  releaseEscrow: async (data: { bookingId: string; releaseType: 'FULL' | 'PARTIAL' | 'DEPOSIT_ONLY'; releaseAmount?: number }): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post('/payments/release-escrow', data);
    return response.data;
  },

  // Withdraw funds
  withdraw: async (data: { amount: number; provider: string; phoneNumber?: string; bankAccount?: string }): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post('/payments/withdraw', data);
    return response.data;
  },

  // Get escrow status for a booking
  getEscrowStatus: async (bookingId: string): Promise<{ success: boolean; data: EscrowStatus }> => {
    const response = await apiClient.get(`/payments/escrow/${bookingId}`);
    return response.data;
  },

  // Get payments for a booking
  getBookingPayments: async (bookingId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  // Refund a payment
  refundPayment: async (bookingId: string, amount?: number): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post(`/payments/refund/${bookingId}`, { amount });
    return response.data;
  },
};