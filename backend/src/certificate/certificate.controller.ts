import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CertificateService } from './certificate.service';

@Controller('certificates')
export class CertificateController {
  constructor(private service: CertificateService) {}

  @Post()
  create(@Body() body: { employeeId: string; courseId: string; issuedAt?: Date; expiresAt?: Date; certificateUrl?: string }) {
    return this.service.create(body);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
