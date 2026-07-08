import { Controller, Get, Req, Res, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  @Get('session')
  async getSession(@Req() req: Request) {
    const userId = (req as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.authService.getUserById(userId);
  }

  @Post('sign-in')
  async signIn(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const user = await this.authService.findUserByEmail(body.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return res.json({ user });
  }

  @Post('sign-up')
  async signUp(@Body() body: { email: string; name: string; password: string }) {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(body.password, 10);
    return this.authService.createUser({
      email: body.email,
      name: body.name,
      password: hashed,
    });
  }
}
