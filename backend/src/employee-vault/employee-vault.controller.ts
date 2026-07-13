import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { EmployeeVaultService } from './employee-vault.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { UploadUrlDto } from './dto/upload-url.dto';

@ApiTags('employee-vault')
@ApiBearerAuth()
@Controller('employee-vault')
@UseGuards(RolesGuard)
export class EmployeeVaultController {
  constructor(private service: EmployeeVaultService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vault item' })
  create(@Body() dto: CreateVaultItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get vault items by employee' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a presigned upload URL for a document' })
  getUploadUrl(@Body() dto: UploadUrlDto) {
    return this.service.getUploadUrl(dto.employeeId, dto.filename);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vault item by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get a presigned download URL for a vault item' })
  getDownloadUrl(@Param('id', ParseCuidPipe) id: string) {
    return this.service.getDownloadUrl(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vault item' })
  remove(@Param('id', ParseCuidPipe) id: string) {
    return this.service.remove(id);
  }
}
