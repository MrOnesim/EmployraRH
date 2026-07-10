import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a document' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get documents by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.documentService.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get documents by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.documentService.findByEmployee(employeeId);
  }

  @Get('type')
  @ApiOperation({ summary: 'Get documents by type' })
  findByType(@Query('companyId') companyId: string, @Query('type') type: string) {
    return this.documentService.findByType(companyId, type);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
