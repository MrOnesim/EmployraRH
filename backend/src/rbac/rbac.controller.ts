import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { RbacService } from './rbac.service';
import { SetPermissionsDto } from './dto/set-permissions.dto';

@ApiTags('rbac')
@ApiBearerAuth()
@Controller('rbac')
@UseGuards(RolesGuard)
export class RbacController {
  constructor(private service: RbacService) {}

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  getRoles() {
    return this.service.getRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  getPermissions() {
    return this.service.getPermissions();
  }

  @Get('check')
  @ApiOperation({ summary: 'Check whether a role has a permission' })
  check(@Query('role') role: string, @Query('permission') permission: string) {
    return this.service.check(role, permission);
  }

  @Get('roles/:role/permissions')
  @ApiOperation({ summary: 'Get permissions for a role' })
  getRolePermissions(@Param('role') role: string) {
    return this.service.getRolePermissions(role);
  }

  @Put('roles/:role/permissions')
  @ApiOperation({ summary: 'Set permissions for a role' })
  setRolePermissions(@Param('role') role: string, @Body() dto: SetPermissionsDto) {
    return this.service.setRolePermissions(role, dto.permissions);
  }
}
