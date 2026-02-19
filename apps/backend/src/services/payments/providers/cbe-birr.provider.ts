import { PaymentProvider, PaymentRequest, PaymentResponse } from './base-provider';

export class CbeBirrProvider implements PaymentProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.CBE_BIRR_API_KEY || 'test_key';
    this.apiUrl = process.env.CBE_BIRR_API_URL || 'https://sandbox.cbebirr.com/api';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log(`í³± Processing CBE Birr payment for ${request.amount} ETB to ${request.phoneNumber}`);
      
      // In production, this would call the actual CBE Birr API
      // For development, we'll simulate a successful payment
      
      // Validate Ethiopian phone number
      if (!request.phoneNumber?.startsWith('+251')) {
        return {
          success: false,
          status: 'FAILED',
          message: 'Invalid Ethiopian phone number',
        };
      }

      // Simulate payment processing
      const transactionId = `CBE-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      return {
        success: true,
        transactionId,
        reference: `REF-${Date.now()}`,
        status: 'COMPLETED',
        message: 'Payment processed successfully via CBE Birr',
        metadata: {
          provider: 'CBE_BIRR',
          phoneNumber: request.phoneNumber,
        },
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'CBE Birr payment failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    // Simulate verification
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
