import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { BetterAuthService } from './better-auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware, OnModuleInit {
  private handler: ReturnType<typeof toNodeHandler>;

  constructor(private betterAuthService: BetterAuthService) {}

  onModuleInit() {
    this.handler = toNodeHandler(this.betterAuthService.auth);
  }

  use(req: Request, res: Response, next: () => void) {
    this.handler(req as any, res as any).catch((err) => {
      console.error('[AuthMiddleware] better-auth error:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
    });
  }
}
