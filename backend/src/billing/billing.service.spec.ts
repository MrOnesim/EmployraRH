import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { ProviderRegistry } from './providers/provider.registry';
import { MoneyFusionProvider } from './providers/money-fusion.provider';
import { PrismaService } from '../prisma/prisma.service';
import { BillingProvider, SubscriptionStatus } from '@prisma/client';

function mockPrisma() {
  const store: any = {
    plans: [] as any[],
    coupons: [] as any[],
    subscriptions: [] as any[],
    payments: [] as any[],
    invoices: [] as any[],
    events: [] as any[],
    webhooks: [] as any[],
  };
  let seq = 0;
  const id = () => `id_${++seq}`;
  return {
    store,
    client: {
      plan: {
        findMany: async (q: any) => store.plans.filter((p) => !q?.where?.active || p.active),
        findUnique: async (q: any) => store.plans.find((p) => p.id === q.where.id) ?? null,
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.plans.push(row);
          return row;
        },
        update: async (q: any) => {
          const r = store.plans.find((p) => p.id === q.where.id)!;
          Object.assign(r, q.data);
          return r;
        },
      },
      coupon: {
        findUnique: async (q: any) => store.coupons.find((c) => c.code === q.where.code) ?? null,
        create: async (q: any) => {
          const row = { id: id(), usedCount: 0, active: true, ...q.data };
          store.coupons.push(row);
          return row;
        },
        update: async (q: any) => {
          const r = store.coupons.find((c) => c.id === q.where.id)!;
          if (q.data.usedCount?.increment) r.usedCount += q.data.usedCount.increment;
          else Object.assign(r, q.data);
          return r;
        },
      },
      company: { findUnique: async (q: any) => (q.where.id ? { id: q.where.id } : null) },
      employee: {
        findFirst: async (q: any) =>
          store.employees?.find((e) => e.companyId === q.where.companyId) ?? null,
      },
      subscription: {
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.subscriptions.push(row);
          return row;
        },
        findUnique: async (q: any) => {
          const s = store.subscriptions.find((x) => x.id === q.where.id);
          if (!s) return null;
          const plan = store.plans.find((p) => p.id === s.planId) ?? null;
          const coupon = store.coupons.find((c) => c.id === s.couponId) ?? null;
          const payments = store.payments.filter((p) => p.subscriptionId === s.id);
          const invoices = store.invoices.filter((i) => i.subscriptionId === s.id);
          const events = store.events.filter((e) => e.subscriptionId === s.id);
          return { ...s, plan, coupon, payments, invoices, events };
        },
        findMany: async (q: any) => {
          return store.subscriptions
            .filter((s) => s.companyId === q?.where?.companyId)
            .map((s) => ({
              ...s,
              plan: store.plans.find((p) => p.id === s.planId) ?? null,
              coupon: store.coupons.find((c) => c.id === s.couponId) ?? null,
              payments: store.payments.filter((p) => p.subscriptionId === s.id),
              invoices: store.invoices.filter((i) => i.subscriptionId === s.id),
              events: store.events.filter((e) => e.subscriptionId === s.id),
            }));
        },
        update: async (q: any) => {
          const r = store.subscriptions.find((s) => s.id === q.where.id)!;
          Object.assign(r, q.data);
          return r;
        },
        updateMany: async (q: any) => {
          store.subscriptions
            .filter((s) => s.companyId === q.where.companyId)
            .forEach((s) => Object.assign(s, q.data));
          return { count: 1 };
        },
      },
      payment: {
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.payments.push(row);
          return row;
        },
        findFirst: async (q: any) =>
          store.payments.find((p) =>
            q.where.providerRef
              ? p.providerRef === q.where.providerRef
              : p.subscriptionId === q.where.subscriptionId && p.status === q.where.status,
          ) ?? null,
        update: async (q: any) => {
          const r = store.payments.find((p) => p.id === q.where.id)!;
          Object.assign(r, q.data);
          return r;
        },
        updateMany: async () => ({ count: 1 }),
      },
      invoice: {
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.invoices.push(row);
          return row;
        },
        findFirst: async (q: any) =>
          store.invoices
            .filter(
              (i) =>
                i.subscriptionId === q.where.subscriptionId &&
                (!q.where.status || i.status === q.where.status),
            )
            .sort((a: any, b: any) => b.issuedAt - a.issuedAt)[0] ?? null,
        update: async (q: any) => {
          const r = store.invoices.find((i) => i.id === q.where.id)!;
          Object.assign(r, q.data);
          return r;
        },
        updateMany: async (q: any) => {
          store.invoices
            .filter((i) => i.subscriptionId === q.where.subscriptionId)
            .forEach((i: any) => Object.assign(i, q.data));
          return { count: 1 };
        },
      },
      subscriptionEvent: {
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.events.push(row);
          return row;
        },
      },
      webhookEvent: {
        create: async (q: any) => {
          const row = { id: id(), ...q.data };
          store.webhooks.push(row);
          return row;
        },
        update: async (q: any) => {
          const r = store.webhooks.find((w) => w.id === q.where.id)!;
          Object.assign(r, q.data);
          return r;
        },
      },
    },
  };
}

describe('BillingService', () => {
  let service: BillingService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(async () => {
    prisma = mockPrisma();
    const provider = new MoneyFusionProvider();
    const registry = new ProviderRegistry();
    registry.register(provider);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: ProviderRegistry, useValue: registry },
        { provide: PrismaService, useValue: prisma.client },
      ],
    }).compile();
    Object.assign((BillingService as any).prototype, {});
    service = module.get(BillingService);
    (service as any).prisma = prisma.client;
    (service as any).registry = registry;
  });

  it('creates a plan', async () => {
    const plan = await service.createPlan({
      name: 'Business',
      price: 50000,
      currency: 'XOF',
      trialDays: 14,
    });
    expect(plan.id).toBeDefined();
    expect(plan.trialDays).toBe(14);
  });

  it('subscribes with trial and issues an invoice', async () => {
    const plan = await service.createPlan({
      name: 'Pro',
      price: 30000,
      currency: 'XOF',
      trialDays: 30,
    });
    const sub = await service.subscribe({ companyId: 'comp_1', planId: plan.id });
    expect(sub.status).toBe<SubscriptionStatus>('TRIAL');
    expect(sub.trialEndsAt).not.toBeNull();
    const subs = await service.listSubscriptions('comp_1');
    expect(subs[0].invoices.length).toBe(1);
    expect(subs[0].events.length).toBeGreaterThan(0);
  });

  it('applies coupon discount', async () => {
    const plan = await service.createPlan({ name: 'Std', price: 10000, currency: 'XOF' });
    const coupon = await service.createCoupon({ code: 'WELCOME20', type: 'percent', value: 20 });
    await service.subscribe({
      companyId: 'comp_2',
      planId: plan.id,
      couponCode: 'WELCOME20',
    });
    const subs = await service.listSubscriptions('comp_2');
    expect(subs[0].invoices[0].amount).toBe(8000);
    expect(coupon.usedCount).toBe(1);
  });

  it('processes a successful webhook and activates subscription', async () => {
    const plan = await service.createPlan({
      name: 'Paid',
      price: 20000,
      currency: 'XOF',
      trialDays: 15,
    });
    const sub = await service.subscribe({ companyId: 'comp_3', planId: plan.id });
    const pay = await service.startPayment(sub.id);
    const providerRef = pay.payment.providerRef;
    const payload = JSON.stringify({ providerRef, status: 'SUCCESS' });
    const evt = await service.handleWebhook(
      BillingProvider.MONEY_FUSION,
      'payment',
      payload,
      `sha256=:${payload.length}`,
    );
    const updated = await service.getSubscription(sub.id);
    expect(updated.status).toBe<SubscriptionStatus>('ACTIVE');
    expect(evt.status).toBe('PROCESSED');
  });

  it('records change-plan history', async () => {
    const a = await service.createPlan({ name: 'A', price: 1000, currency: 'XOF' });
    const b = await service.createPlan({ name: 'B', price: 5000, currency: 'XOF' });
    const sub = await service.subscribe({ companyId: 'comp_4', planId: a.id });
    await service.changePlan(sub.id, b.id);
    const updated = await service.getSubscription(sub.id);
    expect(updated.planId).toBe(b.id);
    expect(updated.events.length).toBeGreaterThan(1);
  });
});
