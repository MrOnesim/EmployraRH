import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ensureCsrfCookie } from '../common/security/request-security';

@ApiTags('auth')
@Controller('security')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('csrf')
  @ApiOperation({ summary: 'Issue un token CSRF pour les appels API mutables' })
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const csrfToken = ensureCsrfCookie(req, res);
    return { csrfToken };
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const user = (req as any).user;
    if (!user?.id) throw new UnauthorizedException();
    const fullUser = await this.authService.getUserById(user.id);
    if (!fullUser) throw new UnauthorizedException();
    const { password, ...safe } = fullUser;
    return safe;
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change le mot de passe et invalide toutes les sessions actives' })
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = (req as any).user;
    if (!user?.id) throw new UnauthorizedException();

    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    return { success: true };
  }

  @Post('logout-all')
  @ApiOperation({ summary: 'Invalide toutes les sessions actives de l’utilisateur courant' })
  async logoutAll(@Req() req: Request) {
    const user = (req as any).user;
    if (!user?.id) throw new UnauthorizedException();

    await this.authService.revokeAllUserSessions(user.id);
    return { success: true };
  }
}
