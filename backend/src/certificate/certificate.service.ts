import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async findByEmployee(employeeId: string) {
    return this.prisma.certificate.findMany({ where: { employeeId }, orderBy: { issuedAt: 'desc' } });
  }

  async findById(id: string) {
    return this.prisma.certificate.findUnique({ where: { id } });
  }

  async create(data: { employeeId: string; courseId: string; issuedAt?: Date; expiresAt?: Date; certificateUrl?: string }) {
    return this.prisma.certificate.create({
      data: { ...data, issuedAt: data.issuedAt || new Date() },
    });
  }
}
