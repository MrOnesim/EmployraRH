import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient, BillingProvider, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { ProviderRegistry } from './providers/provider.registry';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { SubscribeDto } from './dto/subscribe.dto';

const PERIOD_DAYS: Record<string, number> = { month: 30, year: 365, week: 7 };

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly prisma = new PrismaClient();

  constructor(private readonly registry: ProviderRegistry) {}

  private periodEnd(interval: string): Date {
    const days = PERIOD_DAYS[interval] ?? 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async listPlans() {
    return this.prisma.plan.findMany({ where: { active: true }, orderBy: { price: 'asc' } });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.plan.create({ data: dto });
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    await this.getPlan(id);
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createCoupon(dto: CreateCouponDto) {
    return this.prisma.coupon.create({ data: { ...dto, type: dto.type ?? 'percent' } });
  }

  private async resolveCoupon(code?: string) {
    if (!code) return null;
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.active) return null;
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return null;
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return null;
    return coupon;
  }

  async subscribe(dto: SubscribeDto) {
    const company = await this.prisma.company.findUnique({ where: { id: dto.companyId } });
    if (!company) throw new NotFoundException('Company not found');
    const plan = await this.getPlan(dto.planId);
    const coupon = await this.resolveCoupon(dto.couponCode);

    const trialEndsAt =
      plan.trialDays > 0 ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000) : null;
    const status: SubscriptionStatus = plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';

    const subscription = await this.prisma.subscription.create({
      data: {
        companyId: dto.companyId,
        planId: plan.id,
        couponId: coupon?.id ?? null,
        provider: dto.provider ?? BillingProvider.MONEY_FUSION,
        status,
        trialEndsAt,
        currentPeriodEnd: trialEndsAt ?? this.periodEnd(plan.interval),
      },
    });

    await this.recordEvent(subscription.id, null, status, `Subscription started on ${plan.name}`);

    if (coupon) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    await this.issueInvoice(subscription.id, plan, coupon);
    return subscription;
  }

  async listSubscriptions(companyId: string) {
    return this.prisma.subscription.findMany({
      where: { companyId },
      include: { plan: true, coupon: true, payments: true, invoices: true, events: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, coupon: true, payments: true, invoices: true, events: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async cancelSubscription(id: string) {
    const sub = await this.getSubscription(id);
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED', cancelAt: new Date(), cancelledAt: new Date() },
    });
    await this.recordEvent(id, sub.status, 'CANCELLED', 'Subscription cancelled');
    return updated;
  }

  async changePlan(id: string, planId: string) {
    const sub = await this.getSubscription(id);
    const plan = await this.getPlan(planId);
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: {
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodEnd: this.periodEnd(plan.interval),
      },
    });
    await this.recordEvent(id, sub.status, 'ACTIVE', `Plan changed to ${plan.name}`);
    await this.issueInvoice(
      id,
      plan,
      sub.couponId ? await this.prisma.coupon.findUnique({ where: { id: sub.couponId } }) : null,
    );
    return updated;
  }

  private async recordEvent(
    subscriptionId: string,
    from: SubscriptionStatus | null,
    to: SubscriptionStatus,
    note: string,
  ) {
    await this.prisma.subscriptionEvent.create({
      data: { subscriptionId, fromStatus: from, toStatus: to, note },
    });
  }

  private async issueInvoice(
    subscriptionId: string,
    plan: { price: number; currency: string; taxRate: number; taxExempt: boolean },
    coupon: { type: string; value: number } | null,
  ) {
    let amount = plan.price;
    if (coupon) {
      amount =
        coupon.type === 'percent'
          ? amount * (1 - coupon.value / 100)
          : Math.max(0, amount - coupon.value);
    }
    amount = Math.round(amount * 100) / 100;
    const taxAmount = plan.taxExempt ? 0 : Math.round(amount * plan.taxRate * 100) / 100;
    const number = `INV-${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.invoice.create({
      data: {
        subscriptionId,
        number,
        amount,
        taxAmount,
        currency: plan.currency,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async startPayment(subscriptionId: string) {
    const sub = await this.getSubscription(subscriptionId);
    const provider = this.registry.get(sub.provider);
    const invoice = await this.prisma.invoice.findFirst({
      where: { subscriptionId, status: PaymentStatus.PENDING },
      orderBy: { issuedAt: 'desc' },
    });
    const amount = invoice ? invoice.amount + invoice.taxAmount : sub.plan.price;
    const member = await this.prisma.employee.findFirst({
      where: { companyId: sub.companyId },
      select: { email: true },
    });
    const customerReference = member?.email ?? `company-${sub.companyId.slice(-8)}@employepro.com`;
    const created = await provider.createPayment({
      amount,
      currency: sub.plan.currency,
      description: `Subscription ${sub.plan.name}`,
      customerReference,
    });
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId,
        provider: sub.provider,
        providerRef: created.providerRef,
        amount,
        currency: sub.plan.currency,
        method: 'MOBILE_MONEY',
        status: PaymentStatus.PENDING,
      },
    });
    return { payment, paymentUrl: created.paymentUrl };
  }

  async handleWebhook(
    provider: BillingProvider,
    eventType: string,
    payload: string,
    signature?: string,
  ) {
    const providerImpl = this.registry.get(provider);
    const valid = providerImpl.verifyWebhookSignature(payload, signature);
    const providerRef = this.extractProviderRef(payload);
    const event = await this.prisma.webhookEvent.create({
      data: {
        provider,
        eventType,
        providerRef,
        payload,
        signature,
        status: valid ? 'RECEIVED' : 'INVALID_SIGNATURE',
      },
    });
    if (!valid) return event;

    try {
      const parsed = JSON.parse(payload) as {
        providerRef?: string;
        status?: string;
        data?: { reference?: string; status?: string };
      };
      const ref = parsed.providerRef ?? parsed.data?.reference;
      const status = parsed.status ?? parsed.data?.status;
      if (ref) {
        await this.applyPaymentStatus(ref, status);
      }
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Webhook processing failed: ${(err as Error).message}`);
      await this.prisma.webhookEvent.update({
        where: { id: event.id },
        data: { status: 'FAILED' },
      });
    }
    return event;
  }

  private async applyPaymentStatus(providerRef: string, status?: string) {
    const payment = await this.prisma.payment.findFirst({ where: { providerRef } });
    if (!payment) return;
    const mapped: PaymentStatus =
      status === 'SUCCESS'
        ? PaymentStatus.SUCCESS
        : status === 'FAILED'
          ? PaymentStatus.FAILED
          : payment.status;
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: mapped, paidAt: mapped === PaymentStatus.SUCCESS ? new Date() : null },
    });
    if (mapped === PaymentStatus.SUCCESS) {
      await this.prisma.invoice.updateMany({
        where: { subscriptionId: payment.subscriptionId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
      });
      const sub = await this.prisma.subscription.findUnique({
        where: { id: payment.subscriptionId },
      });
      if (sub && (sub.status === 'TRIAL' || sub.status === 'PAST_DUE')) {
        const old = sub.status;
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'ACTIVE', currentPeriodEnd: this.periodEnd('month') },
        });
        await this.recordEvent(sub.id, old, 'ACTIVE', 'Payment confirmed via webhook');
      }
    }
  }

  async listWebhookEvents() {
    return this.prisma.webhookEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  private extractProviderRef(payload: string): string | null {
    try {
      const parsed = JSON.parse(payload) as { providerRef?: string; data?: { reference?: string } };
      return parsed.providerRef ?? parsed.data?.reference ?? null;
    } catch {
      return null;
    }
  }
}
