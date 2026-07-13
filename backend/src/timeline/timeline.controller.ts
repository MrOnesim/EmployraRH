import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { TimelineService } from './timeline.service';
import { CreateTimelineEventDto } from './dto/create-timeline-event.dto';

@ApiTags('timeline')
@ApiBearerAuth()
@Controller('timeline')
@UseGuards(RolesGuard)
export class TimelineController {
  constructor(private service: TimelineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a timeline event' })
  create(@Body() dto: CreateTimelineEventDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get timeline events by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get timeline events by employee' })
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }
}
