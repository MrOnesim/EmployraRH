import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { CountryProviderRegistry } from './providers/provider.registry';
import { FranceProvider } from './providers/france.provider';
import { BeninProvider } from './providers/benin.provider';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [ComplianceService, CountryProviderRegistry, FranceProvider, BeninProvider],
  exports: [ComplianceService, CountryProviderRegistry],
})
export class ComplianceModule {
  constructor(
    private readonly registry: CountryProviderRegistry,
    private readonly france: FranceProvider,
    private readonly benin: BeninProvider,
  ) {
    this.registry.register(this.france);
    this.registry.register(this.benin);
  }
}
