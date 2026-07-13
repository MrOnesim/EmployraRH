import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(RolesGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.companyService.findById(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a company' })
  addMember(@Param('id', ParseCuidPipe) id: string, @Body() dto: AddMemberDto) {
    return this.companyService.addMember(id, dto.userId, dto.role as any);
  }
}
