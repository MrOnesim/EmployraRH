import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { CertificateService } from './certificate.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller('certificates')
@UseGuards(RolesGuard)
export class CertificateController {
  constructor(private service: CertificateService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate certificate for employee who passed a course' })
  generate(@Body() dto: GenerateCertificateDto) {
    return this.service.generate(dto.courseId, dto.employeeId, dto.certificateUrl);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get certificates by employee' })
  findByEmployee(@Param('employeeId', ParseCuidPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get certificates by course' })
  findByCourse(@Param('courseId', ParseCuidPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/verify/:verifiedById')
  @ApiOperation({ summary: 'Verify a certificate' })
  verify(
    @Param('id', ParseCuidPipe) id: string,
    @Param('verifiedById', ParseCuidPipe) verifiedById: string,
  ) {
    return this.service.verify(id, verifiedById);
  }
}
