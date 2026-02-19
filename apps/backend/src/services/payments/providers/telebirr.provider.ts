import { PaymentProvider, PaymentRequest, PaymentResponse } from './base-provider';

export class TelebirrProvider implements PaymentProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.TELEBIRR_API_KEY || 'test_key';
    this.apiUrl = process.env.TELEBIRR_API_URL || 'https://sandbox.telebirr.com/api';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log(`í³± Processing Telebirr payment for ${request.amount} ETB to ${request.phoneNumber}`);
      
      if (!request.phoneNumber?.startsWith('+251')) {
        return {
          success: false,
          status: 'FAILED',
          message: 'Invalid Ethiopian phone number',
        };
      }

      const transactionId = `TLB-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      return {
        success: true,
        transactionId,
        reference: `REF-${Date.now()}`,
        status: 'COMPLETED',
        message: 'Payment processed successfully via Telebirr',
        metadata: {
          provider: 'TELEBIRR',
          phoneNumber: request.phoneNumber,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Telebirr payment failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId,
      status: 'COMPLETED',
      message: 'Payment verified',
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId,
      status: 'COMPLETED',
      message: `Refunded ${amount ? amount : 'full amount'} successfully`,
    };
  }
}
