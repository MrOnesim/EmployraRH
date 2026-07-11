import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { BetterAuthService } from './better-auth.service';
import { AuthRateLimitMiddleware } from './auth-rate-limit.middleware';
import { MailModule } from '../mail/mail.module';
import { GdprModule } from '../gdpr/gdpr.module';

@Module({
  imports: [MailModule, GdprModule],
  controllers: [AuthController],
  providers: [AuthService, BetterAuthService],
  exports: [AuthService, BetterAuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthRateLimitMiddleware, AuthMiddleware)
      .forRoutes(
        { path: 'api/auth/*', method: RequestMethod.ALL },
        { path: 'api/auth/callback/*', method: RequestMethod.ALL },
        { path: 'api/auth/verify/*', method: RequestMethod.ALL },
      );
  }
}
