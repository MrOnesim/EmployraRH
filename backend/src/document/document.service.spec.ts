import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: any;

  const mockDocument = {
    id: 'doc-1',
    employeeId: 'emp-1',
    name: 'Contract.pdf',
    type: 'contract',
    url: 'https://storage.example.com/contract.pdf',
    createdAt: new Date('2026-07-01'),
  };

  beforeEach(async () => {
    prisma = {
      document: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  describe('create', () => {
    const createData = {
      employeeId: 'emp-1',
      name: 'Resume.pdf',
      type: 'resume',
      url: 'https://storage.example.com/resume.pdf',
    };

    it('should create a document successfully', async () => {
      prisma.document.create.mockResolvedValue({ id: 'doc-2', ...createData });

      const result = await service.create(createData);

      expect(result.id).toBe('doc-2');
      expect(prisma.document.create).toHaveBeenCalledWith({ data: createData });
    });

    it('should throw BadRequestException when name is empty', async () => {
      await expect(service.create({ ...createData, name: '' })).rejects.toThrow(BadRequestException);
      await expect(service.create({ ...createData, name: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is empty', async () => {
      await expect(service.create({ ...createData, type: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when url is empty', async () => {
      await expect(service.create({ ...createData, url: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEmployee', () => {
    it('should return documents for an employee', async () => {
      const docs = [mockDocument];
      prisma.document.findMany.mockResolvedValue(docs);

      const result = await service.findByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no documents exist', async () => {
      prisma.document.findMany.mockResolvedValue([]);

      const result = await service.findByEmployee('emp-unknown');

      expect(result).toEqual([]);
    });
  });

  describe('findByCompany', () => {
    it('should return documents for a company with employee included', async () => {
      const docs = [{ ...mockDocument, employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' } }];
      prisma.document.findMany.mockResolvedValue(docs);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' } },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByType', () => {
    it('should return documents by type for a company', async () => {
      const docs = [{ ...mockDocument, employee: { id: 'emp-1' } }];
      prisma.document.findMany.mockResolvedValue(docs);

      const result = await service.findByType('comp-1', 'contract');

      expect(result).toHaveLength(1);
      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { employee: { companyId: 'comp-1' }, type: 'contract' },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a document successfully', async () => {
      prisma.document.findUnique.mockResolvedValue(mockDocument);
      prisma.document.delete.mockResolvedValue(mockDocument);

      const result = await service.delete('doc-1');

      expect(result.id).toBe('doc-1');
    });

    it('should throw NotFoundException when document not found', async () => {
      prisma.document.findUnique.mockResolvedValue(null);

      await expect(service.delete('doc-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
