export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber?: string;
  accountNumber?: string;
  reference: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;
}
