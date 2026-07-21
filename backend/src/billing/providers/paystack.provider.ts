import { Injectable, Logger } from '@nestjs/common';
import { BillingProvider } from '@prisma/client';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  RefundResult,
  VerifyPaymentResult,
} from './payment-provider.interface';
import { createHmac } from 'crypto';

const PAYSTACK_API = 'https://api.paystack.co';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  readonly name = BillingProvider.PAYSTACK;
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY ?? '';
  private readonly publicKey = process.env.PAYSTACK_PUBLIC_KEY ?? '';

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${PAYSTACK_API}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok || !json.status) {
      this.logger.error(`Paystack error ${res.status}: ${JSON.stringify(json)}`);
      throw new Error(`Paystack ${path} failed: ${json.message ?? res.statusText}`);
    }
    return json.data;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const amountKobo = Math.round(input.amount * 100);
    const data = await this.request('POST', '/transaction/initialize', {
      email: input.customerReference,
      amount: amountKobo,
      currency: input.currency ?? 'XOF',
      reference: `emp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      callback_url: input.callbackUrl,
    });
    this.logger.log(`Paystack createPayment ref=${data.reference} url=${data.authorization_url}`);
    return {
      providerRef: data.reference,
      paymentUrl: data.authorization_url,
      status: 'PENDING',
    };
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    const data = await this.request(
      'GET',
      `/transaction/verify/${encodeURIComponent(providerRef)}`,
    );
    const statusMap: Record<string, 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'> = {
      success: 'SUCCESS',
      failed: 'FAILED',
      abandoned: 'EXPIRED',
      reversed: 'FAILED',
      processing: 'PROCESSING',
    };
    return {
      providerRef,
      status: statusMap[data.status] ?? 'PENDING',
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
    };
  }

  async refund(providerRef: string, amount?: number): Promise<RefundResult> {
    const data = await this.request('POST', '/refund', {
      transaction: providerRef,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return { providerRef, status: data.status === 'success' ? 'REFUNDED' : 'FAILED' };
  }

  verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
    if (!signature) return false;
    const expected = createHmac('sha512', this.secretKey).update(payload).digest('hex');
    return expected === signature;
  }
}
