import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './better-auth.setup';

const handler = toNodeHandler(auth);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response) {
    handler(req as any, res as any);
  }
}
