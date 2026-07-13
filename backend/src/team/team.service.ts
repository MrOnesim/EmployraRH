import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.team.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundException(`Team with id "${id}" not found`);
    return team;
  }

  async create(data: {
    companyId: string;
    name: string;
    description?: string;
    leaderId?: string;
    memberIds?: string[];
  }) {
    if (!data.name || !data.name.trim()) throw new BadRequestException('Name is required');
    return this.prisma.team.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description ?? '',
        leaderId: data.leaderId ?? null,
        memberIds: data.memberIds ?? [],
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string; leaderId?: string; memberIds?: string[] },
  ) {
    await this.findById(id);
    return this.prisma.team.update({ where: { id }, data });
  }

  async addMember(id: string, employeeId: string) {
    const team = await this.findById(id);
    if (team.memberIds.includes(employeeId))
      throw new BadRequestException('Employee is already a team member');
    return this.prisma.team.update({
      where: { id },
      data: { memberIds: [...team.memberIds, employeeId] },
    });
  }

  async removeMember(id: string, employeeId: string) {
    const team = await this.findById(id);
    return this.prisma.team.update({
      where: { id },
      data: { memberIds: team.memberIds.filter((m) => m !== employeeId) },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.team.delete({ where: { id } });
  }
}
