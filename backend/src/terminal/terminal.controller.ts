import { Controller, Post, Get, Patch, Param, Delete, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { RegisterTerminalDto } from './dto/register-terminal.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('terminals')
@ApiBearerAuth()
@Controller('terminals')
@UseGuards(RolesGuard)
export class TerminalController {
  constructor(private terminalService: TerminalService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new terminal' })
  register(@Body() dto: RegisterTerminalDto) {
    return this.terminalService.register(dto.companyId, { name: dto.name, deviceFingerprint: dto.deviceFingerprint });
  }

  @Get()
  @ApiOperation({ summary: 'List terminals by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.terminalService.findByCompany(companyId);
  }

  @Get('fingerprint/:deviceFingerprint')
  @ApiOperation({ summary: 'Get terminal by device fingerprint' })
  getByFingerprint(@Param('deviceFingerprint') deviceFingerprint: string) {
    return this.terminalService.getByFingerprint(deviceFingerprint);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get terminal by ID' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalService.findById(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a terminal' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a terminal' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalService.deactivate(id);
  }

  @Patch(':id/last-seen')
  @ApiOperation({ summary: 'Update terminal last seen timestamp' })
  updateLastSeen(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalService.updateLastSeen(id);
  }
}
