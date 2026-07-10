import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SignatureTemplateService } from './signature-template.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SignatureTemplateService', () => {
  let service: SignatureTemplateService;
  let prisma: any;

  const mockTemplate = {
    id: 'tmpl-1',
    name: 'Employment Contract',
    description: 'Standard employment contract',
    documentType: 'employment',
    content: 'Dear {{name}}, welcome to {{company}}!',
    placeholders: ['name', 'company'],
    companyId: 'comp-1',
  };

  beforeEach(async () => {
    prisma = {
      signatureTemplate: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureTemplateService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SignatureTemplateService>(SignatureTemplateService);
  });

  describe('findAll', () => {
    it('should return all templates', async () => {
      prisma.signatureTemplate.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by companyId', async () => {
      prisma.signatureTemplate.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a template by id', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(mockTemplate);
      const result = await service.findById('tmpl-1');
      expect(result.id).toBe('tmpl-1');
    });

    it('should throw when not found', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return templates for a company', async () => {
      prisma.signatureTemplate.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByDocumentType', () => {
    it('should return templates by document type', async () => {
      prisma.signatureTemplate.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.findByDocumentType('comp-1', 'employment');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a template successfully', async () => {
      prisma.signatureTemplate.create.mockResolvedValue(mockTemplate);
      const result = await service.create({
        name: 'Employment Contract', documentType: 'employment',
        content: 'Dear {{name}}', companyId: 'comp-1',
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should throw when name is empty', async () => {
      await expect(service.create({
        name: '', documentType: 'employment', content: 'test', companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when document type is empty', async () => {
      await expect(service.create({
        name: 'Test', documentType: '', content: 'test', companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when content is empty', async () => {
      await expect(service.create({
        name: 'Test', documentType: 'employment', content: '', companyId: 'comp-1',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateDocument', () => {
    it('should replace placeholders in the template', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(mockTemplate);
      const result = await service.generateDocument('tmpl-1', { name: 'Alice', company: 'Acme Corp' });
      expect(result.content).toBe('Dear Alice, welcome to Acme Corp!');
      expect(result.documentName).toBe('Employment Contract');
    });

    it('should leave unknown placeholders as-is', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(mockTemplate);
      const result = await service.generateDocument('tmpl-1', { name: 'Alice' });
      expect(result.content).toContain('{{company}}');
    });

    it('should throw when template not found', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(null);
      await expect(service.generateDocument('unknown', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.signatureTemplate.update.mockResolvedValue({ ...mockTemplate, name: 'Updated' });
      const result = await service.update('tmpl-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw when not found', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(null);
      await expect(service.update('unknown', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a template', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(mockTemplate);
      prisma.signatureTemplate.delete.mockResolvedValue(mockTemplate);
      const result = await service.delete('tmpl-1');
      expect(result).toEqual(mockTemplate);
    });

    it('should throw when not found', async () => {
      prisma.signatureTemplate.findUnique.mockResolvedValue(null);
      await expect(service.delete('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
