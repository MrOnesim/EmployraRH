import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
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
  findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a company' })
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.companyService.addMember(id, dto.userId, dto.role as any);
  }
}
