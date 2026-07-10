import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailerService: { sendMail: any };

  beforeEach(async () => {
    delete process.env.SMTP_HOST;
    mailerService = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService, { provide: MailerService, useValue: mailerService }],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should not throw and skip sending when SMTP is not configured', async () => {
    await expect(
      service.sendMail({ to: 'a@b.com', subject: 's', template: 'welcome', context: {} }),
    ).resolves.toBeUndefined();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });
});
