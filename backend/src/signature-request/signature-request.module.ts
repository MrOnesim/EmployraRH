import { Module } from '@nestjs/common';
import { SignatureRequestService } from './signature-request.service';
import { SignatureRequestController } from './signature-request.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [SignatureRequestController],
  providers: [SignatureRequestService],
  exports: [SignatureRequestService],
})
export class SignatureRequestModule {}
