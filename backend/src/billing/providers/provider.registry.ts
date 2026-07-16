import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingProvider } from '@prisma/client';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class ProviderRegistry {
  private readonly providers = new Map<BillingProvider, PaymentProvider>();

  register(provider: PaymentProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: BillingProvider): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`Payment provider ${name} is not configured`);
    }
    return provider;
  }

  getForSubscription(name: BillingProvider): PaymentProvider {
    return this.get(name);
  }
}
