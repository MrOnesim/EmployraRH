import { Controller, Post, Get, Param, Delete, Body, Query } from '@nestjs/common';
import { TerminalService } from './terminal.service';

@Controller('terminals')
export class TerminalController {
  constructor(private terminalService: TerminalService) {}

  @Post('register')
  register(@Body() body: { name: string; deviceFingerprint: string; companyId: string }) {
    return this.terminalService.register(body.name, body.deviceFingerprint, body.companyId);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.terminalService.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.terminalService.findById(id);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.terminalService.deactivate(id);
  }
}
