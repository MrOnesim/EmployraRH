import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { newEnforcer, newModelFromString, Enforcer } from 'casbin';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaCasbinAdapter } from './prisma-casbin.adapter';
import { RBAC_MODEL, DEFAULT_ROLE_PERMISSIONS } from './default-policies';

@Injectable()
export class RbacService implements OnModuleInit {
  private enforcer!: Enforcer;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const model = newModelFromString(RBAC_MODEL);
    const adapter = new PrismaCasbinAdapter(this.prisma);
    this.enforcer = await newEnforcer(model, adapter);
    const existing = await this.enforcer.getPolicy();
    if (existing.length === 0) await this.seedDefaults();
  }

  private async seedDefaults() {
    for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        await this.enforcer.addPolicy(role, permission);
      }
    }
  }

  async getRoles(): Promise<string[]> {
    return this.enforcer.getAllSubjects();
  }

  async getPermissions(): Promise<string[]> {
    return this.enforcer.getAllObjects();
  }

  async getRolePermissions(role: string): Promise<string[]> {
    const policies = await this.enforcer.getFilteredPolicy(0, role);
    return policies.map((policy) => policy[1]);
  }

  async setRolePermissions(role: string, permissions: string[]): Promise<string[]> {
    if (!role || !role.trim()) throw new BadRequestException('Role is required');
    await this.enforcer.removeFilteredPolicy(0, role);
    for (const permission of permissions) {
      await this.enforcer.addPolicy(role, permission);
    }
    return this.getRolePermissions(role);
  }

  async check(
    role: string,
    permission: string,
  ): Promise<{ role: string; permission: string; allowed: boolean }> {
    const allowed = await this.enforcer.enforce(role, permission);
    return { role, permission, allowed };
  }
}
