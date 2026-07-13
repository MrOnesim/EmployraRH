import { RbacService } from './rbac.service';

describe('RbacService', () => {
  let service: RbacService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      casbinRule: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
      },
    };
    service = new RbacService(prisma);
    await service.onModuleInit();
  });

  it('should seed default policies on init', () => {
    expect(prisma.casbinRule.create).toHaveBeenCalled();
  });

  it('should allow ADMIN to view employees', async () => {
    const result = await service.check('ADMIN', 'view_employees');
    expect(result.allowed).toBe(true);
  });

  it('should deny EMPLOYEE from managing employees', async () => {
    const result = await service.check('EMPLOYEE', 'manage_employees');
    expect(result.allowed).toBe(false);
  });

  it('should return permissions for a role', async () => {
    const perms = await service.getRolePermissions('EMPLOYEE');
    expect(perms).toContain('view_attendance');
    expect(perms).not.toContain('manage_employees');
  });

  it('should list roles', async () => {
    const roles = await service.getRoles();
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('EMPLOYEE');
  });

  it('should update permissions for a role', async () => {
    await service.setRolePermissions('MANAGER', ['view_reports', 'view_teams']);
    const perms = await service.getRolePermissions('MANAGER');
    expect(perms).toEqual(expect.arrayContaining(['view_reports', 'view_teams']));
    expect(perms).not.toContain('view_attendance');
  });
});
