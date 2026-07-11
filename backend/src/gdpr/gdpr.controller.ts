import {
  Controller,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GdprService } from './gdpr.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('gdpr')
@UseGuards(RolesGuard)
export class GdprController {
  constructor(private gdprService: GdprService) {}

  @Delete('users/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'DPO/Admin: supprime (droit à l’effacement) un utilisateur par id' })
  async eraseUser(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const actor = (req as any).user;
    if (!actor?.id) throw new UnauthorizedException();
    return this.gdprService.eraseUserAsAdmin(actor.id, id);
  }
}
