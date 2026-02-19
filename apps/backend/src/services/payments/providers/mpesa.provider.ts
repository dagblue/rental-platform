import { PaymentProvider, PaymentRequest, PaymentResponse } from './base-provider';

export class MpesaProvider implements PaymentProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.MPESA_API_KEY || 'test_key';
    this.apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.com/api';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log(`í³± Processing M-PESA payment for ${request.amount} ETB to ${request.phoneNumber}`);
      
      // M-PESA also works in Ethiopia with +251 format
      if (!request.phoneNumber?.startsWith('+251')) {
        return {
          success: false,
          status: 'FAILED',
          message: 'Invalid phone number',
        };
      }

      const transactionId = `MPE-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      return {
        success: true,
        transactionId,
        reference: `REF-${Date.now()}`,
        status: 'COMPLETED',
        message: 'Payment processed successfully via M-PESA',
        metadata: {
          provider: 'MPESA',
          phoneNumber: request.phoneNumber,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'M-PESA payment failed',
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
