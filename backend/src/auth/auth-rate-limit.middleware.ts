import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const SIGN_IN_LIMIT = { limit: 5, ttlMs: 10 * 60 * 1000 };
const AUTH_DEFAULT_LIMIT = { limit: 30, ttlMs: 60 * 1000 };

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitRecord>();

  use(req: Request, res: Response, next: NextFunction) {
    const tracker = req.ips?.length ? req.ips[0] : req.ip;
    const routeKey = req.path.includes('sign-in') || req.path.includes('sign-up')
      ? 'credential'
      : 'default';
    const strategy = routeKey === 'credential' ? SIGN_IN_LIMIT : AUTH_DEFAULT_LIMIT;
    const key = `${tracker}:${routeKey}`;
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || current.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + strategy.ttlMs });
      return next();
    }

    if (current.count >= strategy.limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        message: 'Too many authentication attempts. Please try again later.',
      });
    }

    current.count += 1;
    this.store.set(key, current);
    next();
  }
}
