import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class QrTokenService {
  private readonly secret: string;
  private readonly tokenDurationMs = 45_000;

  constructor() {
    this.secret = process.env.QR_SECRET || 'employrarh-qr-secret-dev';
  }

  generateToken(employeeId: string, companyId: string): string {
    const payload = `${employeeId}.${companyId}.${Date.now()}`;
    const signature = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return `${payload}.${signature}`;
  }

  validateToken(token: string): { employeeId: string; companyId: string; valid: boolean; reason?: string } {
    const parts = token.split('.');
    if (parts.length < 4) return { employeeId: '', companyId: '', valid: false, reason: 'Invalid token format' };

    const timestamp = parseInt(parts[2], 10);
    const employeeId = parts[0];
    const companyId = parts[1];
    const signature = parts.slice(3).join('.');

    const payload = `${employeeId}.${companyId}.${timestamp}`;
    const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

    if (signature !== expected) return { employeeId, companyId, valid: false, reason: 'Invalid token signature' };

    const age = Date.now() - timestamp;
    if (age > this.tokenDurationMs) return { employeeId, companyId, valid: false, reason: 'Token expired' };

    return { employeeId, companyId, valid: true };
  }

  refreshToken(employeeId: string, companyId: string): string {
    return this.generateToken(employeeId, companyId);
  }

  getTokenDurationMs(): number {
    return this.tokenDurationMs;
  }
}
