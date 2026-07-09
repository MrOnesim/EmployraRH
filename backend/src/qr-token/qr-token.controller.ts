import { Controller, Post, Body } from '@nestjs/common';
import { QrTokenService } from './qr-token.service';

@Controller('qr-tokens')
export class QrTokenController {
  constructor(private qrTokenService: QrTokenService) {}

  @Post('generate')
  generate(@Body() body: { employeeId: string; companyId: string }) {
    const token = this.qrTokenService.generateToken(body.employeeId, body.companyId);
    const expiresInMs = this.qrTokenService.getTokenDurationMs();
    return { token, expiresInMs, employeeId: body.employeeId, companyId: body.companyId };
  }
}
