import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { PayslipPdfService } from './payslip-pdf.service';
import { CountryProviderRegistry } from './providers/provider.registry';
import { FranceProvider } from './providers/france.provider';
import { BeninProvider } from './providers/benin.provider';
import { CoteDivoireProvider } from './providers/cote-d-ivoire.provider';
import { SenegalProvider } from './providers/senegal.provider';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    PayslipPdfService,
    CountryProviderRegistry,
    FranceProvider,
    BeninProvider,
    CoteDivoireProvider,
    SenegalProvider,
  ],
  exports: [ComplianceService, PayslipPdfService, CountryProviderRegistry],
})
export class ComplianceModule {
  constructor(
    private readonly registry: CountryProviderRegistry,
    private readonly france: FranceProvider,
    private readonly benin: BeninProvider,
    private readonly coteDivoire: CoteDivoireProvider,
    private readonly senegal: SenegalProvider,
  ) {
    this.registry.register(this.france);
    this.registry.register(this.benin);
    this.registry.register(this.coteDivoire);
    this.registry.register(this.senegal);
  }
}
