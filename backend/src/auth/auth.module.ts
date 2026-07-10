import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { BetterAuthService } from './better-auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, BetterAuthService],
  exports: [AuthService, BetterAuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'api/auth/*', method: RequestMethod.ALL },
      { path: 'api/auth/callback/*', method: RequestMethod.ALL },
      { path: 'api/auth/verify/*', method: RequestMethod.ALL },
    );
  }
}
