import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.contract.findMany({ where: { employeeId }, orderBy: { startDate: 'desc' } });
  }

  async findById(id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException(`Contract with id "${id}" not found`);
    return contract;
  }

  async create(data: {
    employeeId: string;
    type: string;
    position: string;
    startDate: string;
    endDate?: string;
    salary: number;
    documentUrl?: string;
  }) {
    if (!data.position || !data.position.trim())
      throw new BadRequestException('Position is required');
    if (data.salary < 0) throw new BadRequestException('Salary must be positive');
    const start = new Date(data.startDate);
    const end = data.endDate ? new Date(data.endDate) : null;
    if (end && end <= start) throw new BadRequestException('End date must be after start date');
    return this.prisma.contract.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        position: data.position,
        startDate: start,
        endDate: end,
        salary: data.salary,
        documentUrl: data.documentUrl ?? null,
        status: 'active',
      },
    });
  }

  async update(
    id: string,
    data: {
      type?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      salary?: number;
      status?: string;
      documentUrl?: string;
    },
  ) {
    await this.findById(id);
    if (data.salary !== undefined && data.salary < 0)
      throw new BadRequestException('Salary must be positive');
    return this.prisma.contract.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }
}
