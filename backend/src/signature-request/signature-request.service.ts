import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SignatureRequestService {
  constructor(
    private prisma: PrismaService,
    @Optional() private mailService: MailService,
  ) {}

  async findAll(companyId?: string) {
    return this.prisma.signatureRequest.findMany({
      ...(companyId ? { where: { companyId } } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const request = await this.prisma.signatureRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(`Signature request with id "${id}" not found`);
    return request;
  }

  async findByCompany(companyId: string) {
    return this.prisma.signatureRequest.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    documentName: string;
    documentType: string;
    initiatedBy: string;
    initiatedByName: string;
    companyId: string;
    message?: string;
    recipients?: any;
    expiresAt?: Date;
  }) {
    if (!data.documentName || !data.documentName.trim())
      throw new BadRequestException('Document name is required');
    if (!data.documentType || !data.documentType.trim())
      throw new BadRequestException('Document type is required');
    const recipients = data.recipients;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new BadRequestException('Recipients must be a non-empty JSON array');
    }
    return this.prisma.signatureRequest.create({
      data: { ...data, recipients, status: 'draft' },
    });
  }

  async send(id: string) {
    const request = await this.findById(id);
    if (request.status !== 'draft')
      throw new BadRequestException(`Cannot send request with status "${request.status}"`);
    const updated = await this.prisma.signatureRequest.update({
      where: { id },
      data: { status: 'sent' },
    });
    await this.notifySigners(updated);
    return updated;
  }

  async sign(id: string, recipientEmail: string) {
    const request = await this.findById(id);
    if (request.status !== 'sent')
      throw new BadRequestException(`Cannot sign request with status "${request.status}"`);

    const recipients = request.recipients as any[];
    const recipientIndex = recipients.findIndex((r: any) => r.email === recipientEmail);
    if (recipientIndex === -1)
      throw new NotFoundException(
        `Recipient with email "${recipientEmail}" not found in this request`,
      );
    if (recipients[recipientIndex].signed)
      throw new BadRequestException(`Recipient "${recipientEmail}" has already signed`);

    recipients[recipientIndex].signed = true;
    recipients[recipientIndex].signedAt = new Date().toISOString();

    const allSigned = recipients.every((r: any) => r.signed);

    return this.prisma.signatureRequest.update({
      where: { id },
      data: { recipients, ...(allSigned ? { status: 'signed' } : {}) },
    });
  }

  async complete(id: string) {
    const request = await this.findById(id);
    if (request.status !== 'signed')
      throw new BadRequestException(`Cannot complete request with status "${request.status}"`);

    const recipients = request.recipients as any[];
    const allSigned = recipients.every((r: any) => r.signed);
    if (!allSigned) throw new BadRequestException('Not all recipients have signed yet');

    const updated = await this.prisma.signatureRequest.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
    await this.notifyRequester(updated);
    return updated;
  }

  async reject(id: string, reason: string) {
    const request = await this.findById(id);
    if (request.status !== 'sent')
      throw new BadRequestException(`Cannot reject request with status "${request.status}"`);
    return this.prisma.signatureRequest.update({
      where: { id },
      data: { status: 'rejected', message: reason },
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.signatureRequest.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.signatureRequest.delete({ where: { id } });
  }

  private async notifySigners(request: any) {
    if (!this.mailService) return;
    try {
      const recipients = (request.recipients as any[]) || [];
      const link = `${process.env.FRONTEND_URL || ''}/signature-requests/${request.id}`;
      for (const recipient of recipients) {
        if (recipient?.email) {
          await this.mailService.sendMail({
            to: recipient.email,
            subject: `Signature requested: ${request.documentName}`,
            template: 'signature-request',
            context: {
              initiatedByName: request.initiatedByName,
              documentName: request.documentName,
              documentType: request.documentType,
              message: request.message || '',
              link,
            },
          });
        }
      }
    } catch {
      return;
    }
  }

  private async notifyRequester(request: any) {
    if (!this.mailService) return;
    try {
      const user = await this.prisma.user.findUnique({ where: { id: request.initiatedBy } });
      if (!user?.email) return;
      const link = `${process.env.FRONTEND_URL || ''}/signature-requests/${request.id}`;
      await this.mailService.sendMail({
        to: user.email,
        subject: `Document fully signed: ${request.documentName}`,
        template: 'signature-completed',
        context: {
          documentName: request.documentName,
          link,
        },
      });
    } catch {
      return;
    }
  }
}
