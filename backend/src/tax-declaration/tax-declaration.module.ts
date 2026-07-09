import { Module } from '@nestjs/common';
import { TaxDeclarationService } from './tax-declaration.service';
import { TaxDeclarationController } from './tax-declaration.controller';

@Module({
  controllers: [TaxDeclarationController],
  providers: [TaxDeclarationService],
  exports: [TaxDeclarationService],
})
export class TaxDeclarationModule {}
