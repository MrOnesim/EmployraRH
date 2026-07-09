import { Module } from '@nestjs/common';
import { SignatureRequestService } from './signature-request.service';
import { SignatureRequestController } from './signature-request.controller';

@Module({
  controllers: [SignatureRequestController],
  providers: [SignatureRequestService],
  exports: [SignatureRequestService],
})
export class SignatureRequestModule {}
