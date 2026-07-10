import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SignatureRequestService } from './signature-request.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SignatureRequestService', () => {
  let service: SignatureRequestService;
  let prisma: any;

  const mockRequest = {
    id: 'sig-1',
    documentName: 'Contract',
    documentType: 'employment',
    initiatedBy: 'emp-1',
    initiatedByName: 'John Doe',
    companyId: 'comp-1',
    message: 'Please sign',
    recipients: [
      { email: 'alice@test.com', signed: false, signedAt: null },
      { email: 'bob@test.com', signed: false, signedAt: null },
    ],
    status: 'draft',
    expiresAt: null,
    createdAt: new Date(),
    completedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      signatureRequest: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureRequestService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SignatureRequestService>(SignatureRequestService);
  });

  describe('findAll', () => {
    it('should return all requests', async () => {
      prisma.signatureRequest.findMany.mockResolvedValue([mockRequest]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by companyId', async () => {
      prisma.signatureRequest.findMany.mockResolvedValue([mockRequest]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return a request by id', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      const result = await service.findById('sig-1');
      expect(result.id).toBe('sig-1');
    });

    it('should throw when not found', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCompany', () => {
    it('should return requests for a company', async () => {
      prisma.signatureRequest.findMany.mockResolvedValue([mockRequest]);
      const result = await service.findByCompany('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a signature request', async () => {
      prisma.signatureRequest.create.mockResolvedValue(mockRequest);
      const result = await service.create({
        documentName: 'Contract', documentType: 'employment',
        initiatedBy: 'emp-1', initiatedByName: 'John Doe',
        companyId: 'comp-1',
        recipients: [{ email: 'alice@test.com' }, { email: 'bob@test.com' }],
      });
      expect(result).toEqual(mockRequest);
    });

    it('should throw when document name is empty', async () => {
      await expect(service.create({
        documentName: '', documentType: 'employment',
        initiatedBy: 'emp-1', initiatedByName: 'John Doe',
        companyId: 'comp-1',
        recipients: [{ email: 'alice@test.com' }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when document type is empty', async () => {
      await expect(service.create({
        documentName: 'Contract', documentType: '',
        initiatedBy: 'emp-1', initiatedByName: 'John Doe',
        companyId: 'comp-1',
        recipients: [{ email: 'alice@test.com' }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw when recipients is empty', async () => {
      await expect(service.create({
        documentName: 'Contract', documentType: 'employment',
        initiatedBy: 'emp-1', initiatedByName: 'John Doe',
        companyId: 'comp-1',
        recipients: [],
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('send', () => {
    it('should send a draft request', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.signatureRequest.update.mockResolvedValue({ ...mockRequest, status: 'sent' });
      const result = await service.send('sig-1');
      expect(result.status).toBe('sent');
    });

    it('should throw when not draft', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue({ ...mockRequest, status: 'sent' });
      await expect(service.send('sig-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('sign', () => {
    it('should sign a request as a recipient', async () => {
      const sentRequest = { ...mockRequest, status: 'sent' };
      prisma.signatureRequest.findUnique.mockResolvedValue(sentRequest);
      prisma.signatureRequest.update.mockResolvedValue({ ...sentRequest, recipients: [{ email: 'alice@test.com', signed: true, signedAt: expect.any(String) }, { email: 'bob@test.com', signed: false, signedAt: null }] });
      const result = await service.sign('sig-1', 'alice@test.com');
      expect(result).toBeDefined();
    });

    it('should throw when request not sent', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      await expect(service.sign('sig-1', 'alice@test.com')).rejects.toThrow(BadRequestException);
    });

    it('should throw when recipient not found', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue({ ...mockRequest, status: 'sent' });
      await expect(service.sign('sig-1', 'unknown@test.com')).rejects.toThrow(NotFoundException);
    });

    it('should throw when recipient already signed', async () => {
      const sentWithSignedRecipient = {
        ...mockRequest, status: 'sent',
        recipients: [{ email: 'alice@test.com', signed: true, signedAt: '2026-01-01' }, { email: 'bob@test.com', signed: false, signedAt: null }],
      };
      prisma.signatureRequest.findUnique.mockResolvedValue(sentWithSignedRecipient);
      await expect(service.sign('sig-1', 'alice@test.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete a signed request', async () => {
      const signedRequest = {
        ...mockRequest, status: 'signed',
        recipients: [{ email: 'alice@test.com', signed: true, signedAt: '2026-01-01' }, { email: 'bob@test.com', signed: true, signedAt: '2026-01-01' }],
      };
      prisma.signatureRequest.findUnique.mockResolvedValue(signedRequest);
      prisma.signatureRequest.update.mockResolvedValue({ ...signedRequest, status: 'completed', completedAt: new Date() });
      const result = await service.complete('sig-1');
      expect(result.status).toBe('completed');
    });

    it('should throw when not signed', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      await expect(service.complete('sig-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when not all recipients have signed', async () => {
      const partiallySigned = {
        ...mockRequest, status: 'signed',
        recipients: [{ email: 'alice@test.com', signed: true, signedAt: '2026-01-01' }, { email: 'bob@test.com', signed: false, signedAt: null }],
      };
      prisma.signatureRequest.findUnique.mockResolvedValue(partiallySigned);
      await expect(service.complete('sig-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a sent request', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue({ ...mockRequest, status: 'sent' });
      prisma.signatureRequest.update.mockResolvedValue({ ...mockRequest, status: 'rejected', message: 'Not agreed' });
      const result = await service.reject('sig-1', 'Not agreed');
      expect(result.status).toBe('rejected');
    });

    it('should throw when not sent', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      await expect(service.reject('sig-1', 'reason')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.signatureRequest.update.mockResolvedValue({ ...mockRequest, message: 'Updated message' });
      const result = await service.update('sig-1', { message: 'Updated message' });
      expect(result.message).toBe('Updated message');
    });

    it('should throw when not found', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(null);
      await expect(service.update('unknown', { message: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a request', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(mockRequest);
      prisma.signatureRequest.delete.mockResolvedValue(mockRequest);
      const result = await service.delete('sig-1');
      expect(result).toEqual(mockRequest);
    });

    it('should throw when not found', async () => {
      prisma.signatureRequest.findUnique.mockResolvedValue(null);
      await expect(service.delete('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
