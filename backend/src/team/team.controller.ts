import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(RolesGuard)
export class TeamController {
  constructor(private service: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  create(@Body() dto: CreateTeamDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get teams by company' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.service.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  findById(@Param('id', ParseCuidPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team' })
  update(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdateTeamDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a team' })
  addMember(@Param('id', ParseCuidPipe) id: string, @Body('employeeId') employeeId: string) {
    return this.service.addMember(id, employeeId);
  }

  @Delete(':id/members/:employeeId')
  @ApiOperation({ summary: 'Remove a member from a team' })
  removeMember(@Param('id', ParseCuidPipe) id: string, @Param('employeeId') employeeId: string) {
    return this.service.removeMember(id, employeeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team' })
  remove(@Param('id', ParseCuidPipe) id: string) {
    return this.service.remove(id);
  }
}
