import { Request, Response } from 'express';
import { PaymentService } from '../../services/payments/payment.service';
import { createPaymentDto, CreatePaymentDto } from '../../dto/payments/payment-request.dto';
import { releaseEscrowDto, ReleaseEscrowDto } from '../../dto/payments/escrow-release.dto';
import { withdrawalDto, WithdrawalDto } from '../../dto/payments/withdrawal.dto';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async processPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: CreatePaymentDto = createPaymentDto.parse(req.body);
      const result = await this.paymentService.processPayment(userId, validatedData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async releaseEscrow(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      
      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: ReleaseEscrowDto = releaseEscrowDto.parse(req.body);
      const result = await this.paymentService.releaseEscrow(ownerId, validatedData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async withdraw(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: WithdrawalDto = withdrawalDto.parse(req.body);
      const result = await this.paymentService.processWithdrawal(userId, validatedData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getWallet(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.paymentService.getWalletBalance(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.paymentService.getTransactionHistory(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getBookingPayments(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { bookingId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.paymentService.getBookingPayments(bookingId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getEscrowStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { bookingId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.paymentService.getEscrowStatus(bookingId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async refundPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { bookingId } = req.params;
      const { amount } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.paymentService.refundPayment(bookingId, userId, amount);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
