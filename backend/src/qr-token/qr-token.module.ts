import { Module } from '@nestjs/common';
import { QrTokenController } from './qr-token.controller';
import { QrTokenService } from './qr-token.service';

@Module({
  controllers: [QrTokenController],
  providers: [QrTokenService],
  exports: [QrTokenService],
})
export class QrTokenModule {}
