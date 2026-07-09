import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SignatureTemplateService } from './signature-template.service';

@Controller('signature-templates')
export class SignatureTemplateController {
  constructor(private service: SignatureTemplateService) {}

  @Post()
  create(@Body() body: { name: string; description?: string; documentType: string; content: string; placeholders?: any; companyId: string }) {
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
