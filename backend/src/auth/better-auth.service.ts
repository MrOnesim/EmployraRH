import { Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins/bearer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public auth: any;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const trustedOrigins = [
      process.env.FRONTEND_URL,
      process.env.BETTER_AUTH_URL,
      process.env.APP_BASE_URL,
    ].filter((value): value is string => !!value);

    this.auth = betterAuth({
      database: prismaAdapter(this.prisma, { provider: 'postgresql' }),
      emailAndPassword: { enabled: true },
      trustedOrigins,
      plugins: [bearer()],
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
        microsoft: {
          clientId: process.env.MICROSOFT_CLIENT_ID || '',
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
        },
      },
      user: {
        additionalFields: {
          normalizedEmail: {
            type: 'string',
            required: false,
            unique: true,
            input: false,
            returned: false,
          },
        },
      },
    });
  }
}
