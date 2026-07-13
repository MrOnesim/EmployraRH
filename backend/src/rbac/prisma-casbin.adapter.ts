import { Adapter, Model, Helper } from 'casbin';
import { PrismaService } from '../prisma/prisma.service';

interface CasbinRow {
  ptype: string;
  v0?: string;
  v1?: string;
  v2?: string;
  v3?: string;
  v4?: string;
  v5?: string;
}

export class PrismaCasbinAdapter implements Adapter {
  constructor(private prisma: PrismaService) {}

  private toRow(ptype: string, rule: string[]): CasbinRow {
    const row = { ptype } as CasbinRow & Record<string, string>;
    rule.forEach((value, index) => {
      row[`v${index}`] = value;
    });
    return row;
  }

  async loadPolicy(model: Model): Promise<void> {
    const rules = await this.prisma.casbinRule.findMany();
    for (const rule of rules) {
      const line = [rule.ptype, rule.v0, rule.v1, rule.v2, rule.v3, rule.v4, rule.v5]
        .filter((value) => value !== null && value !== undefined && value !== '')
        .join(', ');
      Helper.loadPolicyLine(line, model);
    }
  }

  async savePolicy(model: Model): Promise<boolean> {
    await this.prisma.casbinRule.deleteMany();
    const persist = async (ptype: string, ast: { policy: string[][] }) => {
      for (const rule of ast.policy) {
        await this.prisma.casbinRule.create({ data: this.toRow(ptype, rule) });
      }
    };
    const policies = model.model.get('p');
    if (policies) for (const [ptype, ast] of policies) await persist(ptype, ast);
    const groupings = model.model.get('g');
    if (groupings) for (const [ptype, ast] of groupings) await persist(ptype, ast);
    return true;
  }

  async addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    await this.prisma.casbinRule.create({ data: this.toRow(ptype, rule) });
  }

  async removePolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    await this.prisma.casbinRule.deleteMany({ where: this.toRow(ptype, rule) });
  }

  async removeFilteredPolicy(
    _sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ): Promise<void> {
    const where: Record<string, string> = { ptype };
    fieldValues.forEach((value, index) => {
      if (value !== '' && value !== undefined) where[`v${fieldIndex + index}`] = value;
    });
    await this.prisma.casbinRule.deleteMany({ where });
  }
}
