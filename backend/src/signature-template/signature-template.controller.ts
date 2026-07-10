import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SignatureTemplateService } from './signature-template.service';
import { CreateSignatureTemplateDto } from './dto/create-signature-template.dto';
import { UpdateSignatureTemplateDto } from './dto/update-signature-template.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('signature-templates')
@Controller('signature-templates')
export class SignatureTemplateController {
  constructor(private service: SignatureTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new signature template' })
  create(@Body() dto: CreateSignatureTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all signature templates' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('company/:companyId/type/:documentType')
  @ApiOperation({ summary: 'Get templates by company and document type' })
  findByDocumentType(@Param('companyId') companyId: string, @Param('documentType') documentType: string) {
    return this.service.findByDocumentType(companyId, documentType);
  }

  @Get(':id/generate')
  @ApiOperation({ summary: 'Generate document from template with placeholders' })
  generateDocument(@Param('id') id: string, @Body('placeholders') placeholders: Record<string, string>) {
    return this.service.generateDocument(id, placeholders);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signature template by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a signature template' })
  update(@Param('id') id: string, @Body() dto: UpdateSignatureTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a signature template' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
