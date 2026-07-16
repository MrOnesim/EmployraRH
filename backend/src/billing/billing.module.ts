import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ProviderRegistry } from './providers/provider.registry';
import { MoneyFusionProvider } from './providers/money-fusion.provider';

@Module({
  controllers: [BillingController],
  providers: [
    MoneyFusionProvider,
    {
      provide: ProviderRegistry,
      useFactory: (provider: MoneyFusionProvider) => {
        const registry = new ProviderRegistry();
        registry.register(provider);
        return registry;
      },
      inject: [MoneyFusionProvider],
    },
    BillingService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
