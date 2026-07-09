import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PrismaDelegate = {
  findMany(args?: any): Promise<any[]>;
  findUnique(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
};

@Injectable()
export class BaseService {
  constructor(protected prisma: PrismaService) {}

  protected async findAll(delegate: PrismaDelegate, companyId?: string) {
    return delegate.findMany(companyId ? { where: { companyId } } : undefined);
  }

  protected async findById(delegate: PrismaDelegate, id: string) {
    return delegate.findUnique({ where: { id } });
  }

  protected async findByEmployee(delegate: PrismaDelegate, employeeId: string) {
    return delegate.findMany({ where: { employeeId } });
  }

  protected async create(delegate: PrismaDelegate, data: any) {
    return delegate.create({ data });
  }

  protected async update(delegate: PrismaDelegate, id: string, data: any) {
    return delegate.update({ where: { id }, data });
  }

  protected async delete(delegate: PrismaDelegate, id: string) {
    return delegate.delete({ where: { id } });
  }
}
