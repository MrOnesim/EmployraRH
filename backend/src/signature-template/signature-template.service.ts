import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SignatureTemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    if (companyId) {
      return this.prisma.signatureTemplate.findMany({ where: { companyId }, orderBy: { name: 'asc' } });
    }
    return this.prisma.signatureTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const template = await this.prisma.signatureTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException(`Signature template with id "${id}" not found`);
    return template;
  }

  async findByCompany(companyId: string) {
    return this.prisma.signatureTemplate.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findByDocumentType(companyId: string, documentType: string) {
    return this.prisma.signatureTemplate.findMany({
      where: { companyId, documentType },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; description?: string; documentType: string; content: string; placeholders?: any; companyId: string }) {
    if (!data.name || !data.name.trim()) throw new BadRequestException('Name is required');
    if (!data.documentType || !data.documentType.trim()) throw new BadRequestException('Document type is required');
    if (!data.content || !data.content.trim()) throw new BadRequestException('Content is required');
    return this.prisma.signatureTemplate.create({
      data: { ...data, placeholders: data.placeholders || [] },
    });
  }

  async generateDocument(templateId: string, placeholders: Record<string, string>) {
    const template = await this.findById(templateId);
    let content = template.content;

    for (const [key, value] of Object.entries(placeholders)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return {
      documentName: template.name,
      documentType: template.documentType,
      content,
      placeholders,
    };
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.signatureTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.signatureTemplate.delete({ where: { id } });
  }
}
