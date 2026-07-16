import { BillingProvider } from '@prisma/client';

export interface CreatePaymentInput {
  amount: number;
  currency: string;
  description: string;
  customerReference: string;
  callbackUrl?: string;
}

export interface CreatePaymentResult {
  providerRef: string;
  paymentUrl?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
}

export interface VerifyPaymentResult {
  providerRef: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  paidAt?: Date;
}

export interface RefundResult {
  providerRef: string;
  status: 'REFUNDED' | 'FAILED';
}

export interface PaymentProvider {
  readonly name: BillingProvider;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  verifyPayment(providerRef: string): Promise<VerifyPaymentResult>;

  refund(providerRef: string, amount?: number): Promise<RefundResult>;

  verifyWebhookSignature(payload: string, signature: string | undefined): boolean;
}
