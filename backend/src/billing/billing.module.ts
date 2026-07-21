import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ProviderRegistry } from './providers/provider.registry';
import { MoneyFusionProvider } from './providers/money-fusion.provider';
import { PaystackProvider } from './providers/paystack.provider';

@Module({
  controllers: [BillingController],
  providers: [
    MoneyFusionProvider,
    PaystackProvider,
    {
      provide: ProviderRegistry,
      useFactory: (mf: MoneyFusionProvider, ps: PaystackProvider) => {
        const registry = new ProviderRegistry();
        registry.register(mf);
        registry.register(ps);
        return registry;
      },
      inject: [MoneyFusionProvider, PaystackProvider],
    },
    BillingService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
