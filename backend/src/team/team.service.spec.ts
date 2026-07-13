import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamService', () => {
  let service: TeamService;
  let prisma: any;

  const mockTeam = {
    id: 'team-1',
    companyId: 'comp-1',
    name: 'Engineering',
    description: 'Dev team',
    leaderId: 'emp-1',
    memberIds: ['emp-1', 'emp-2'],
    createdAt: new Date('2026-07-01'),
  };

  beforeEach(async () => {
    prisma = {
      team: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<TeamService>(TeamService);
  });

  it('should return teams by company', async () => {
    prisma.team.findMany.mockResolvedValue([mockTeam]);
    const result = await service.findByCompany('comp-1');
    expect(result).toHaveLength(1);
    expect(prisma.team.findMany).toHaveBeenCalledWith({
      where: { companyId: 'comp-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should throw NotFoundException when team not found', async () => {
    prisma.team.findUnique.mockResolvedValue(null);
    await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create a team', async () => {
    prisma.team.create.mockResolvedValue(mockTeam);
    const result = await service.create({ companyId: 'comp-1', name: 'Engineering' });
    expect(result.id).toBe('team-1');
  });

  it('should throw BadRequestException when name is empty', async () => {
    await expect(service.create({ companyId: 'comp-1', name: '' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should add a member', async () => {
    prisma.team.findUnique.mockResolvedValue(mockTeam);
    prisma.team.update.mockResolvedValue({
      ...mockTeam,
      memberIds: [...mockTeam.memberIds, 'emp-3'],
    });
    const result = await service.addMember('team-1', 'emp-3');
    expect(result.memberIds).toContain('emp-3');
  });

  it('should throw BadRequestException when member already exists', async () => {
    prisma.team.findUnique.mockResolvedValue(mockTeam);
    await expect(service.addMember('team-1', 'emp-1')).rejects.toThrow(BadRequestException);
  });

  it('should remove a member', async () => {
    prisma.team.findUnique.mockResolvedValue(mockTeam);
    prisma.team.update.mockResolvedValue({ ...mockTeam, memberIds: ['emp-1'] });
    const result = await service.removeMember('team-1', 'emp-2');
    expect(result.memberIds).not.toContain('emp-2');
  });

  it('should delete a team', async () => {
    prisma.team.findUnique.mockResolvedValue(mockTeam);
    prisma.team.delete.mockResolvedValue(mockTeam);
    const result = await service.remove('team-1');
    expect(result.id).toBe('team-1');
  });
});
