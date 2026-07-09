import { Module } from '@nestjs/common';
import { SignatureTemplateService } from './signature-template.service';
import { SignatureTemplateController } from './signature-template.controller';

@Module({
  controllers: [SignatureTemplateController],
  providers: [SignatureTemplateService],
  exports: [SignatureTemplateService],
})
export class SignatureTemplateModule {}
