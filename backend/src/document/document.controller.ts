import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  create(@Body() body: { employeeId: string; name: string; type: string; url: string }) {
    return this.documentService.create(body);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.documentService.findAll(companyId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
