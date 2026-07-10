import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MeetingService', () => {
  let service: MeetingService;
  let prisma: any;

  const futureDate = new Date(Date.now() + 86400000 * 7);

  const mockMeeting = {
    id: 'meet-1',
    title: 'Sprint Planning',
    description: 'Plan the next sprint',
    date: futureDate,
    duration: 60,
    link: 'https://meet.example.com/abc',
    location: 'Room B',
    companyId: 'comp-1',
  };

  const mockParticipant = {
    id: 'part-1',
    name: 'John Doe',
    email: 'john@example.com',
    employeeId: 'emp-1',
    meetingId: 'meet-1',
  };

  beforeEach(async () => {
    prisma = {
      meeting: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      meetingParticipant: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
  });

  describe('create', () => {
    it('should create a meeting successfully', async () => {
      const createData = {
        title: 'New Meeting',
        date: new Date(Date.now() + 86400000 * 14),
        duration: 30,
        companyId: 'comp-1',
      };
      prisma.meeting.create.mockResolvedValue({ id: 'meet-2', ...createData, participants: [], _count: { participants: 0 } });

      const result = await service.create(createData);

      expect(result.id).toBe('meet-2');
    });

    it('should throw BadRequestException when title is empty', async () => {
      await expect(
        service.create({ title: '', date: futureDate, duration: 30, companyId: 'comp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when date is in the past', async () => {
      await expect(
        service.create({ title: 'Test', date: new Date('2020-01-01'), duration: 30, companyId: 'comp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid date', async () => {
      await expect(
        service.create({ title: 'Test', date: 'invalid' as any, duration: 30, companyId: 'comp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when duration is zero or negative', async () => {
      await expect(
        service.create({ title: 'Test', date: futureDate, duration: 0, companyId: 'comp-1' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({ title: 'Test', date: futureDate, duration: -10, companyId: 'comp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create meeting with participants', async () => {
      const createData = {
        title: 'Team Meeting',
        date: new Date(Date.now() + 86400000 * 14),
        duration: 45,
        companyId: 'comp-1',
        participants: [{ name: 'John Doe', email: 'john@example.com' }],
      };
      prisma.meeting.create.mockResolvedValue({
        id: 'meet-3',
        title: 'Team Meeting',
        participants: [{ id: 'part-1', name: 'John Doe', email: 'john@example.com' }],
        _count: { participants: 1 },
      });

      const result = await service.create(createData);

      expect(result._count.participants).toBe(1);
      expect(prisma.meeting.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            participants: { create: [{ name: 'John Doe', email: 'john@example.com' }] },
          }),
        }),
      );
    });
  });

  describe('findByCompany', () => {
    it('should return meetings for a company', async () => {
      const meetings = [{ ...mockMeeting, _count: { participants: 2 } }];
      prisma.meeting.findMany.mockResolvedValue(meetings);

      const result = await service.findByCompany('comp-1');

      expect(result).toHaveLength(1);
      expect(prisma.meeting.findMany).toHaveBeenCalledWith({
        where: { companyId: 'comp-1' },
        include: { _count: { select: { participants: true } } },
        orderBy: { date: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a meeting with participants', async () => {
      const meetingWithParts = { ...mockMeeting, participants: [mockParticipant] };
      prisma.meeting.findUnique.mockResolvedValue(meetingWithParts);

      const result = await service.findById('meet-1');

      expect(result.id).toBe('meet-1');
      expect(result.participants).toHaveLength(1);
    });

    it('should throw NotFoundException when meeting not found', async () => {
      prisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.findById('meet-unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a meeting successfully', async () => {
      prisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      prisma.meeting.update.mockResolvedValue({ ...mockMeeting, title: 'Updated Title', participants: [] });

      const result = await service.update('meet-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when meeting not found', async () => {
      prisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.update('meet-unknown', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for past meetings', async () => {
      const pastMeeting = { ...mockMeeting, date: new Date('2020-01-01') };
      prisma.meeting.findUnique.mockResolvedValue(pastMeeting);

      await expect(service.update('meet-1', { title: 'Test' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when title becomes empty', async () => {
      prisma.meeting.findUnique.mockResolvedValue(mockMeeting);

      await expect(service.update('meet-1', { title: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete an upcoming meeting successfully', async () => {
      prisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      prisma.meeting.delete.mockResolvedValue(mockMeeting);

      const result = await service.delete('meet-1');

      expect(result.id).toBe('meet-1');
    });

    it('should throw NotFoundException when meeting not found', async () => {
      prisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.delete('meet-unknown')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for past meetings', async () => {
      const pastMeeting = { ...mockMeeting, date: new Date('2020-01-01') };
      prisma.meeting.findUnique.mockResolvedValue(pastMeeting);

      await expect(service.delete('meet-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('addParticipant', () => {
    it('should add a participant successfully', async () => {
      prisma.meeting.findUnique.mockResolvedValue(mockMeeting);
      prisma.meetingParticipant.create.mockResolvedValue(mockParticipant);

      const result = await service.addParticipant('meet-1', { name: 'John Doe', email: 'john@example.com' });

      expect(result.id).toBe('part-1');
      expect(prisma.meetingParticipant.create).toHaveBeenCalledWith({
        data: { name: 'John Doe', email: 'john@example.com', meetingId: 'meet-1' },
      });
    });

    it('should throw NotFoundException when meeting not found', async () => {
      prisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.addParticipant('meet-unknown', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeParticipant', () => {
    it('should remove a participant successfully', async () => {
      prisma.meetingParticipant.findUnique.mockResolvedValue(mockParticipant);
      prisma.meetingParticipant.delete.mockResolvedValue(mockParticipant);

      const result = await service.removeParticipant('meet-1', 'part-1');

      expect(result.id).toBe('part-1');
    });

    it('should throw NotFoundException when participant not found', async () => {
      prisma.meetingParticipant.findUnique.mockResolvedValue(null);

      await expect(service.removeParticipant('meet-1', 'part-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
