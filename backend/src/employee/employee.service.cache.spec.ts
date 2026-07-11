import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

class FakeCache {
  private store = new Map<string, any>();
  async get(key: string) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  async set(key: string, value: any) {
    this.store.set(key, value);
  }
  async del(key: string) {
    this.store.delete(key);
  }
}

describe('EmployeeService caching', () => {
  let service: EmployeeService;
  let prisma: any;
  let cache: FakeCache;

  const mockEmployee = { id: 'emp-1', companyId: 'comp-1' } as any;

  beforeEach(async () => {
    prisma = {
      employee: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    cache = new FakeCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('caches findAll results and serves from cache on repeat', async () => {
    prisma.employee.findMany.mockResolvedValue([mockEmployee]);

    const first = await service.findAll('comp-1');
    expect(prisma.employee.findMany).toHaveBeenCalledTimes(1);

    const second = await service.findAll('comp-1');
    expect(prisma.employee.findMany).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('invalidates list cache on delete', async () => {
    prisma.employee.findUnique.mockResolvedValue(mockEmployee);
    prisma.employee.findMany.mockResolvedValue([mockEmployee]);
    prisma.employee.delete.mockResolvedValue(mockEmployee);

    await service.findAll('comp-1');
    expect(prisma.employee.findMany).toHaveBeenCalledTimes(1);

    await service.delete('emp-1');
    await service.findAll('comp-1');
    expect(prisma.employee.findMany).toHaveBeenCalledTimes(2);
  });
});
