import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';

const sentryDsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn: sentryDsn,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enabled: !!sentryDsn,
  integrations: [Sentry.nestIntegration()],
});
import { validateEnvironment } from './common/security/env.validation';
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  ensureCsrfCookie,
  getAllowedOrigins,
  isSafeMethod,
  matchesAllowedOrigin,
  parseCookieHeader,
} from './common/security/request-security';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const allowedOrigins = getAllowedOrigins();
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', CSRF_HEADER_NAME],
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    ensureCsrfCookie(req, res);

    if (isSafeMethod(req.method)) {
      return next();
    }

    if (!matchesAllowedOrigin(req)) {
      return res.status(403).json({ message: 'Untrusted request origin' });
    }

    if (req.path.startsWith('/api/auth/')) {
      return next();
    }

    const cookies = parseCookieHeader(req.headers.cookie);
    const csrfCookie = cookies[CSRF_COOKIE_NAME];
    const csrfHeader = req.headers[CSRF_HEADER_NAME] || req.headers[CSRF_HEADER_NAME.toLowerCase()];

    if (!csrfCookie || typeof csrfHeader !== 'string' || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  if (sentryDsn) {
    Sentry.setupExpressErrorHandler(expressApp);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Employra RH API')
    .setDescription('API de la plateforme RH multi-pays Employra')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
