import { CreatePaymentDto } from '../../dto/payments/payment-request.dto';
import { ReleaseEscrowDto } from '../../dto/payments/escrow-release.dto';
import { WithdrawalDto } from '../../dto/payments/withdrawal.dto';
import { PaymentProviderFactory, ProviderType } from './providers/provider-factory';
import { PaymentRequest } from './providers/base-provider';

// In-memory stores
const paymentStore = new Map<string, any[]>(); // bookingId -> payments[]
const escrowStore = new Map<string, Escrow>(); // bookingId -> escrow details
const walletStore = new Map<string, Wallet>(); // userId -> wallet
const transactionStore = new Map<string, Transaction[]>(); // userId -> transactions[]

interface Wallet {
  userId: string;
  balance: number;
  heldBalance: number; // Amount in escrow
  availableBalance: number; // balance - heldBalance
  updatedAt: Date;
}

interface Escrow {
  bookingId: string;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  releasedTo: 'OWNER' | 'RENTER' | null;
  releasedAt: Date | null;
  createdAt: Date;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'PAYMENT' | 'REFUND' | 'WITHDRAWAL' | 'DEPOSIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  provider: string;
  reference: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class PaymentService {
  // Calculate Ethiopian taxes and fees
  private calculateFees(amount: number): { tax: number; serviceFee: number; total: number } {
    const tax = amount * 0.15; // 15% VAT
    const serviceFee = amount * 0.05; // 5% platform fee
    const total = amount + tax + serviceFee;
    return { tax, serviceFee, total };
  }

  // Get or create user wallet
  private getWallet(userId: string): Wallet {
    if (!walletStore.has(userId)) {
      walletStore.set(userId, {
        userId,
        balance: 0,
        heldBalance: 0,
        availableBalance: 0,
        updatedAt: new Date(),
      });
    }
    return walletStore.get(userId)!;
  }

  // Create transaction record
  private createTransaction(
    userId: string,
    type: Transaction['type'],
    amount: number,
    status: Transaction['status'],
    provider: string,
    reference: string,
    description: string,
    metadata: Record<string, unknown> = {}
  ): Transaction {
    const transaction: Transaction = {
      id: `TR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      type,
      amount,
      status,
      provider,
      reference,
      description,
      metadata,
      createdAt: new Date(),
    };

    if (!transactionStore.has(userId)) {
      transactionStore.set(userId, []);
    }
    transactionStore.get(userId)!.push(transaction);

    return transaction;
  }

  async processPayment(userId: string, data: CreatePaymentDto) {
    try {
      // Get the appropriate payment provider
      const provider = PaymentProviderFactory.getProvider(data.provider as ProviderType);
      
      // Calculate fees
      const { tax, serviceFee, total } = this.calculateFees(data.amount);
      
      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount: total,
        currency: 'ETB',
        phoneNumber: data.phoneNumber,
        accountNumber: data.accountNumber,
        reference: `BOOK-${data.bookingId}`,
        description: `Payment for booking ${data.bookingId}`,
      };

      // Process payment with provider
      const paymentResponse = await provider.processPayment(paymentRequest);

      if (!paymentResponse.success) {
        return {
          success: false,
          error: paymentResponse.message,
        };
      }

      // Create transaction record
      const transaction = this.createTransaction(
        userId,
        'PAYMENT',
        total,
        'COMPLETED',
        data.provider,
        paymentResponse.transactionId || '',
        `Payment for booking ${data.bookingId}`,
        { bookingId: data.bookingId, tax, serviceFee, ...data.metadata }
      );

      // Hold in escrow (for owner)
      if (!escrowStore.has(data.bookingId)) {
        escrowStore.set(data.bookingId, {
          bookingId: data.bookingId,
          amount: data.amount, // Hold the base amount (without fees)
          status: 'HELD',
          releasedTo: null,
          releasedAt: null,
          createdAt: new Date(),
        });
      }

      // Store payment record
      if (!paymentStore.has(data.bookingId)) {
        paymentStore.set(data.bookingId, []);
      }
      paymentStore.get(data.bookingId)!.push({
        ...data,
        userId,
        transactionId: transaction.id,
        amount: total,
        baseAmount: data.amount,
        tax,
        serviceFee,
        status: 'COMPLETED',
        providerReference: paymentResponse.reference,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId: transaction.id,
          amount: total,
          baseAmount: data.amount,
          tax,
          serviceFee,
          provider: data.provider,
          reference: paymentResponse.reference,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async releaseEscrow(ownerId: string, data: ReleaseEscrowDto) {
    try {
      const escrow = escrowStore.get(data.bookingId);
      
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      if (escrow.status !== 'HELD') {
        throw new Error('Escrow already released or refunded');
      }

      // Get owner wallet
      const wallet = this.getWallet(ownerId);
      
      let releaseAmount = 0;
      if (data.releaseType === 'FULL') {
        releaseAmount = escrow.amount;
      } else if (data.releaseType === 'DEPOSIT_ONLY') {
        releaseAmount = escrow.amount * 0.2; // Assume 20% deposit
      } else {
        releaseAmount = data.releaseAmount;
      }

      // Update wallet
      wallet.balance += releaseAmount;
      wallet.heldBalance -= escrow.amount;
      wallet.availableBalance = wallet.balance - wallet.heldBalance;
      wallet.updatedAt = new Date();

      // Update escrow status
      escrow.status = 'RELEASED';
      escrow.releasedTo = 'OWNER';
      escrow.releasedAt = new Date();

      // Create transaction
      this.createTransaction(
        ownerId,
        'ESCROW_RELEASE',
        releaseAmount,
        'COMPLETED',
        'ESCROW',
        `ESC-${data.bookingId}`,
        `Escrow release for booking ${data.bookingId}`,
        { bookingId: data.bookingId, releaseType: data.releaseType }
      );

      return {
        success: true,
        message: 'Escrow released successfully',
        data: {
          bookingId: data.bookingId,
          releasedAmount: releaseAmount,
          remainingEscrow: escrow.amount - releaseAmount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Escrow release failed',
      };
    }
  }

  async processWithdrawal(userId: string, data: WithdrawalDto) {
    try {
      const wallet = this.getWallet(userId);

      if (wallet.availableBalance < data.amount) {
        throw new Error('Insufficient available balance');
      }

      // Get provider for withdrawal
      const provider = PaymentProviderFactory.getProvider(data.provider as ProviderType);
      
      // Process withdrawal (reverse of payment)
      const withdrawalRequest: PaymentRequest = {
        amount: data.amount,
        currency: 'ETB',
        phoneNumber: data.phoneNumber,
        accountNumber: data.bankAccount,
        reference: `WTH-${Date.now()}`,
        description: 'Withdrawal from wallet',
      };

      // In production, this would call the provider's payout API
      const withdrawalResponse = await provider.processPayment(withdrawalRequest);

      if (!withdrawalResponse.success) {
        throw new Error(withdrawalResponse.message);
      }

      // Update wallet
      wallet.balance -= data.amount;
      wallet.availableBalance = wallet.balance - wallet.heldBalance;
      wallet.updatedAt = new Date();

      // Create transaction
      const transaction = this.createTransaction(
        userId,
        'WITHDRAWAL',
        data.amount,
        'COMPLETED',
        data.provider,
        withdrawalResponse.transactionId || '',
        'Withdrawal from wallet',
        { ...data }
      );

      return {
        success: true,
        message: 'Withdrawal processed successfully',
        data: {
          transactionId: transaction.id,
          amount: data.amount,
          provider: data.provider,
          newBalance: wallet.balance,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed',
      };
    }
  }

  async getWalletBalance(userId: string) {
    const wallet = this.getWallet(userId);
    return {
      success: true,
      data: {
        balance: wallet.balance,
        heldBalance: wallet.heldBalance,
        availableBalance: wallet.availableBalance,
        updatedAt: wallet.updatedAt,
      },
    };
  }

  async getTransactionHistory(userId: string) {
    const transactions = transactionStore.get(userId) || [];
    // Sort with proper typing
    const sortedTransactions = [...transactions].sort((a: Transaction, b: Transaction) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    return {
      success: true,
      data: sortedTransactions,
    };
  }

  async getBookingPayments(bookingId: string) {
    const payments = paymentStore.get(bookingId) || [];
    return {
      success: true,
      data: payments,
    };
  }

  async getEscrowStatus(bookingId: string) {
    const escrow = escrowStore.get(bookingId);
    return {
      success: true,
      data: escrow || { status: 'NOT_FOUND' },
    };
  }

  async refundPayment(bookingId: string, userId: string, amount?: number) {
    try {
      const escrow = escrowStore.get(bookingId);
      
      if (!escrow || escrow.status !== 'HELD') {
        throw new Error('No escrow found or already released');
      }

      const refundAmount = amount || escrow.amount;

      // Get provider from payment record
      const payments = paymentStore.get(bookingId) || [];
      const payment = payments[0]; // Use first payment
      
      if (!payment) {
        throw new Error('No payment found for this booking');
      }

      const provider = PaymentProviderFactory.getProvider(payment.provider as ProviderType);
      
      // Process refund
      const refundResponse = await provider.refundPayment(payment.transactionId, refundAmount);

      if (!refundResponse.success) {
        throw new Error(refundResponse.message);
      }

      // Update escrow
      escrow.status = 'REFUNDED';
      escrow.releasedTo = 'RENTER';
      escrow.releasedAt = new Date();

      // Create transaction for refund
      this.createTransaction(
        userId,
        'REFUND',
        refundAmount,
        'COMPLETED',
        payment.provider,
        refundResponse.transactionId || '',
        `Refund for booking ${bookingId}`,
        { bookingId }
      );

      return {
        success: true,
        message: 'Refund processed successfully',
        data: {
          bookingId,
          refundAmount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }
}
