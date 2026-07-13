import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { WellnessResponseService } from './wellness-response.service';
import { CreateWellnessResponseDto } from './dto/create-wellness-response.dto';

@ApiTags('wellness-responses')
@ApiBearerAuth()
@Controller('wellness-responses')
@UseGuards(RolesGuard)
export class WellnessResponseController {
  constructor(private service: WellnessResponseService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a wellness response' })
  create(@Body() dto: CreateWellnessResponseDto) {
    return this.service.submit(dto.surveyId, dto.employeeId, dto.answers, dto.anonymous);
  }

  @Get()
  @ApiOperation({ summary: 'Get responses by survey, employee, or company' })
  findAll(
    @Query('surveyId') surveyId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('companyId') companyId?: string,
  ) {
    if (surveyId) return this.service.findBySurvey(surveyId);
    if (employeeId) return this.service.findByEmployee(employeeId);
    if (companyId) return this.service.findByCompany(companyId);
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wellness response by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }
}
