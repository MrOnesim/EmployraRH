import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { WellnessSurveyService } from './wellness-survey.service';
import { CreateWellnessSurveyDto } from './dto/create-wellness-survey.dto';
import { UpdateWellnessSurveyDto } from './dto/update-wellness-survey.dto';

@ApiTags('wellness-surveys')
@Controller('wellness-surveys')
@UseGuards(RolesGuard)
export class WellnessSurveyController {
  constructor(private service: WellnessSurveyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wellness survey' })
  create(@Body() dto: CreateWellnessSurveyDto) {
    return this.service.create({ ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined });
  }

  @Get()
  @ApiOperation({ summary: 'Get all wellness surveys' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('active/:companyId')
  @ApiOperation({ summary: 'Get active wellness surveys for company' })
  findActive(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.service.findActive(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wellness survey by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get aggregated results for a survey' })
  getResults(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getResults(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle survey active status' })
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.toggleActive(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wellness survey' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWellnessSurveyDto) {
    return this.service.update(id, dto);
  }
}
