import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SignatureRequestService } from './signature-request.service';

@Controller('signature-requests')
export class SignatureRequestController {
  constructor(private service: SignatureRequestService) {}

  @Post()
  create(@Body() body: { documentName: string; documentType: string; initiatedBy: string; initiatedByName: string; companyId: string; message?: string; recipients?: any; expiresAt?: Date }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
