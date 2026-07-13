import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TimelineService', () => {
  let service: TimelineService;
  let prisma: any;

  const mockEvent = {
    id: 'evt-1',
    employeeId: 'emp-1',
    type: 'hire',
    title: 'Hired',
    description: 'Joined the company',
    date: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      timelineEvent: { findMany: vi.fn(), create: vi.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimelineService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<TimelineService>(TimelineService);
  });

  it('should return events by employee', async () => {
    prisma.timelineEvent.findMany.mockResolvedValue([mockEvent]);
    const result = await service.findByEmployee('emp-1');
    expect(result).toHaveLength(1);
  });

  it('should return events by company', async () => {
    prisma.timelineEvent.findMany.mockResolvedValue([{ ...mockEvent, employee: { id: 'emp-1' } }]);
    const result = await service.findByCompany('comp-1');
    expect(result).toHaveLength(1);
  });

  it('should create an event', async () => {
    prisma.timelineEvent.create.mockResolvedValue(mockEvent);
    const result = await service.create({ employeeId: 'emp-1', type: 'hire', title: 'Hired' });
    expect(result.id).toBe('evt-1');
  });

  it('should throw BadRequestException when title is empty', async () => {
    await expect(service.create({ employeeId: 'emp-1', type: 'hire', title: '' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when type is empty', async () => {
    await expect(service.create({ employeeId: 'emp-1', type: '', title: 'Hired' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
