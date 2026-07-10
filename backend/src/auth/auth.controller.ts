import { Controller, Get, Req, Post, Body, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
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
  async signIn(@Body() dto: SignInDto) {
    const user = await this.authService.findUserByEmail(dto.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { password, ...safe } = user;
    return { user: safe };
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto) {
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.authService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashed,
    });
    const { password, ...safe } = user;
    return safe;
  }
}
