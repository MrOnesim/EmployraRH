import { Controller, Post, Body, Param, Put, Get, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('invitations')
@UseGuards(RolesGuard)
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invitation' })
  create(@Body() dto: CreateInvitationDto) {
    return this.invitationService.create(dto.email, dto.companyId, dto.role);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  accept(@Param('id', ParseCuidPipe) id: string) {
    return this.invitationService.accept(id);
  }

  @Get()
  @ApiOperation({ summary: 'Find invitations by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.invitationService.findByCompany(companyId);
  }
}
