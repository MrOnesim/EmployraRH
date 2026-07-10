import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CalendarEventService', () => {
  let service: CalendarEventService;
  let prisma: any;

  const mockEvent = {
    id: 'event-1',
    title: 'Team Standup',
    description: 'Daily standup meeting',
    date: new Date('2026-07-15'),
    time: '09:00',
    location: 'Room A',
    type: 'meeting',
    allDay: false,
    companyId: 'comp-1',
  };

  beforeEach(async () => {
    prisma = {
      calendarEvent: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarEventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CalendarEventService>(CalendarEventService);
  });

  describe('findByCompany', () => {
    it('should return events for a company', async () => {
      const events = [mockEvent];
      prisma.calendarEvent.findMany.mockResolvedValue(events);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        orderBy: { date: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return an event by id', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findById('event-1');

      expect(result.id).toBe('event-1');
    });

    it('should throw NotFoundException when event not found', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(null);

      await expect(service.findById('event-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDateRange', () => {
    it('should return events within date range', async () => {
      const events = [mockEvent];
      prisma.calendarEvent.findMany.mockResolvedValue(events);

      const result = await service.findByDateRange('comp-1', '2026-07-01', '2026-07-31');

      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid dates', async () => {
      await expect(service.findByDateRange('comp-1', 'invalid', '2026-07-31')).rejects.toThrow(BadRequestException);
      await expect(service.findByDateRange('comp-1', '2026-07-01', 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByType', () => {
    it('should return events of a valid type', async () => {
      const events = [mockEvent];
      prisma.calendarEvent.findMany.mockResolvedValue(events);

      const result = await service.findByType('comp-1', 'meeting');

      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(service.findByType('comp-1', 'invalid_type')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUpcoming', () => {
    it('should return upcoming events with default limit', async () => {
      const events = [mockEvent];
      prisma.calendarEvent.findMany.mockResolvedValue(events);

      const result = await service.findUpcoming('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1', date: { gte: expect.any(Date) } },
        orderBy: { date: 'asc' },
        take: 10,
      });
    });

    it('should return upcoming events with custom limit', async () => {
      prisma.calendarEvent.findMany.mockResolvedValue([]);

      await service.findUpcoming('comp-1', 5);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('create', () => {
    const createData = {
      title: 'New Event',
      date: new Date('2026-08-01'),
      type: 'training',
      companyId: 'comp-1',
    };

    it('should create an event successfully', async () => {
      prisma.calendarEvent.create.mockResolvedValue({ id: 'event-2', ...createData });

      const result = await service.create(createData);

      expect(result.id).toBe('event-2');
    });

    it('should throw BadRequestException when title is empty', async () => {
      await expect(service.create({ ...createData, title: '' })).rejects.toThrow(BadRequestException);
      await expect(service.create({ ...createData, title: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid date', async () => {
      await expect(service.create({ ...createData, date: 'not-a-date' as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(service.create({ ...createData, type: 'invalid' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an event successfully', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);
      prisma.calendarEvent.update.mockResolvedValue({ ...mockEvent, title: 'Updated Title' });

      const result = await service.update('event-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when event not found', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(null);

      await expect(service.update('event-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when title is empty', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      await expect(service.update('event-1', { title: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid type', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      await expect(service.update('event-1', { type: 'invalid' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid date', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      await expect(service.update('event-1', { date: 'bad-date' as any })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an event successfully', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(mockEvent);
      prisma.calendarEvent.delete.mockResolvedValue(mockEvent);

      const result = await service.delete('event-1');

      expect(result.id).toBe('event-1');
    });

    it('should throw NotFoundException when event not found', async () => {
      prisma.calendarEvent.findUnique.mockResolvedValue(null);

      await expect(service.delete('event-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
