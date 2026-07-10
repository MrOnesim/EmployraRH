import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled = !!process.env.SMTP_HOST;

  constructor(private mailerService: MailerService) {}

  async sendMail(options: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    from?: string;
  }) {
    if (!this.enabled) {
      this.logger.warn('SMTP is not configured (SMTP_HOST missing). Skipping email send.');
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: options.to,
        from: options.from,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendRaw(options: { to: string | string[]; subject: string; html: string; from?: string }) {
    if (!this.enabled) {
      this.logger.warn('SMTP is not configured (SMTP_HOST missing). Skipping email send.');
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
