import { Controller, Get, Req, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('session')
  async getSession(@Req() req: Request) {
    const user = (req as any).user;
    if (!user?.id) throw new UnauthorizedException();
    const fullUser = await this.authService.getUserById(user.id);
    if (!fullUser) throw new UnauthorizedException();
    const { password, ...safe } = fullUser;
    return safe;
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() body: { email: string; password: string }) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { password, ...safe } = user;
    return { user: safe };
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() body: { email: string; name: string; password: string }) {
    if (!body.password || body.password.length < 8) {
      throw new UnauthorizedException('Password must be at least 8 characters');
    }
    const hashed = await bcrypt.hash(body.password, 12);
    const user = await this.authService.createUser({
      email: body.email,
      name: body.name,
      password: hashed,
    });
    const { password, ...safe } = user;
    return safe;
  }
}
