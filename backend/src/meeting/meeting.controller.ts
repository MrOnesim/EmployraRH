import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(RolesGuard)
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a meeting' })
  create(@Body() body: CreateMeetingDto) {
    return this.meetingService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get meetings by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.meetingService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meeting by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.meetingService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meeting' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateMeetingDto) {
    return this.meetingService.update(id, body as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meeting' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.meetingService.delete(id);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to meeting' })
  addParticipant(@Param('id', ParseUUIDPipe) id: string, @Body() body: JoinMeetingDto) {
    return this.meetingService.addParticipant(id, body);
  }

  @Delete(':id/participants/:participantId')
  @ApiOperation({ summary: 'Remove participant from meeting' })
  removeParticipant(@Param('id', ParseUUIDPipe) id: string, @Param('participantId', ParseUUIDPipe) participantId: string) {
    return this.meetingService.removeParticipant(id, participantId);
  }
}
