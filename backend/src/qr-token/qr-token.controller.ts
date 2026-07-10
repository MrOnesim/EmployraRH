import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { QrTokenService } from './qr-token.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('qr-tokens')
@Controller('qr-tokens')
export class QrTokenController {
  constructor(private qrTokenService: QrTokenService) {}

  @Post('generate-for-employee')
  @ApiOperation({ summary: 'Generate QR token for a specific employee' })
  generateForEmployee(@Body() body: { employeeId: string; companyId: string }) {
    return this.qrTokenService.generateForEmployee(body.employeeId, body.companyId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh QR token for an employee' })
  refreshToken(@Body() body: { employeeId: string; companyId: string }) {
    return this.qrTokenService.refreshToken(body.employeeId, body.companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get current valid QR token for employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.qrTokenService.findByEmployee(employeeId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a QR token' })
  validateToken(@Body() body: { token: string }) {
    return this.qrTokenService.validateToken(body.token);
  }
}
