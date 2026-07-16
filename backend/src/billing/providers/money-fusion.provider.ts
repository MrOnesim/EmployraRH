import { Injectable, Logger } from '@nestjs/common';
import { BillingProvider } from '@prisma/client';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  RefundResult,
  VerifyPaymentResult,
} from './payment-provider.interface';

@Injectable()
export class MoneyFusionProvider implements PaymentProvider {
  readonly name = BillingProvider.MONEY_FUSION;
  private readonly logger = new Logger(MoneyFusionProvider.name);
  private readonly apiKey = process.env.MONEY_FUSION_API_KEY ?? '';
  private readonly baseUrl = process.env.MONEY_FUSION_BASE_URL ?? 'https://api.moneyfusion.net';

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const providerRef = `mf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(
      `[MOCK] MoneyFusion createPayment amount=${input.amount} ${input.currency} ref=${providerRef}`,
    );
    return Promise.resolve({
      providerRef,
      paymentUrl: `${this.baseUrl}/pay/${providerRef}`,
      status: 'PENDING',
    });
  }

  verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    this.logger.log(`[MOCK] MoneyFusion verifyPayment ref=${providerRef}`);
    return Promise.resolve({ providerRef, status: 'PENDING' });
  }

  refund(providerRef: string): Promise<RefundResult> {
    this.logger.log(`[MOCK] MoneyFusion refund ref=${providerRef}`);
    return Promise.resolve({ providerRef, status: 'REFUNDED' });
  }

  verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
    if (!signature) return false;
    const expected = `sha256=${this.apiKey}:${payload.length}`;
    return expected === signature;
  }
}
