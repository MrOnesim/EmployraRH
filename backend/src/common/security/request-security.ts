import * as crypto from 'crypto';
import type { Request, Response } from 'express';

export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

export function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return acc;

    acc[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.FRONTEND_URL,
    process.env.BETTER_AUTH_URL,
    process.env.APP_BASE_URL,
  ].filter((value): value is string => !!value);

  return [...new Set(configured.map(normalizeOrigin))];
}

export function getRequestOrigin(req: Request): string | null {
  const originHeader = req.headers.origin;
  if (typeof originHeader === 'string' && originHeader.length > 0) {
    return normalizeOrigin(originHeader);
  }

  const refererHeader = req.headers.referer;
  if (typeof refererHeader === 'string' && refererHeader.length > 0) {
    try {
      return normalizeOrigin(new URL(refererHeader).origin);
    } catch {
      return null;
    }
  }

  return null;
}

export function isSafeMethod(method?: string): boolean {
  return CSRF_SAFE_METHODS.has((method || 'GET').toUpperCase());
}

export function ensureCsrfCookie(req: Request, res: Response): string {
  const cookies = parseCookieHeader(req.headers.cookie);
  const existingToken = cookies[CSRF_COOKIE_NAME];
  if (existingToken) {
    return existingToken;
  }

  const token = generateCsrfToken();
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  });

  return token;
}

export function matchesAllowedOrigin(req: Request): boolean {
  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) return false;

  return getAllowedOrigins().includes(requestOrigin);
}
