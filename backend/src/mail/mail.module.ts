import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const host = process.env.SMTP_HOST;
        const transport = host
          ? {
              host,
              port: parseInt(process.env.SMTP_PORT || '587', 10),
              secure: process.env.SMTP_SECURE === 'true',
              auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
            }
          : { jsonTransport: true };
        return {
          transport,
          defaults: { from: process.env.SMTP_FROM || 'no-reply@employepro.local' },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: false },
          },
        };
      },
      inject: [],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
