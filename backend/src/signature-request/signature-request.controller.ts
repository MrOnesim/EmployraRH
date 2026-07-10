import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SignatureRequestService } from './signature-request.service';
import { CreateSignatureRequestDto } from './dto/create-signature-request.dto';
import { UpdateSignatureRequestDto } from './dto/update-signature-request.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('signature-requests')
@Controller('signature-requests')
export class SignatureRequestController {
  constructor(private service: SignatureRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new signature request' })
  create(@Body() dto: CreateSignatureRequestDto) {
    return this.service.create({ ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined });
  }

  @Get()
  @ApiOperation({ summary: 'Get all signature requests' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get signature requests by company' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signature request by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/send')
  @ApiOperation({ summary: 'Send signature request (draft → sent)' })
  send(@Param('id') id: string) {
    return this.service.send(id);
  }

  @Patch(':id/sign')
  @ApiOperation({ summary: 'Sign a document as a recipient' })
  sign(@Param('id') id: string, @Body('recipientEmail') recipientEmail: string) {
    return this.service.sign(id, recipientEmail);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete signature request (all signed)' })
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject signature request' })
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.reject(id, reason);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a signature request' })
  update(@Param('id') id: string, @Body() dto: UpdateSignatureRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a signature request' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
