import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RoleEnum } from '@prisma/client';
import { BillingService } from './billing.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { WebhookQueryDto } from './dto/webhook.dto';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(RolesGuard)
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List active billing plans' })
  @Public()
  listPlans() {
    return this.service.listPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get a billing plan' })
  @Public()
  getPlan(@Param('id', ParseCuidPipe) id: string) {
    return this.service.getPlan(id);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a billing plan' })
  @Roles(RoleEnum.SUPER_ADMIN)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.service.createPlan(dto);
  }

  @Post('plans/:id')
  @ApiOperation({ summary: 'Update a billing plan' })
  @Roles(RoleEnum.SUPER_ADMIN)
  updatePlan(@Param('id', ParseCuidPipe) id: string, @Body() dto: UpdatePlanDto) {
    return this.service.updatePlan(id, dto);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List coupons' })
  @Roles(RoleEnum.SUPER_ADMIN)
  listCoupons() {
    return this.service.listCoupons();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create a coupon' })
  @Roles(RoleEnum.SUPER_ADMIN)
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.service.createCoupon(dto);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe a company to a plan' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.service.subscribe(dto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions for a company' })
  listSubscriptions(@Query('companyId') companyId: string) {
    return this.service.listSubscriptions(companyId);
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get a subscription with history' })
  getSubscription(@Param('id', ParseCuidPipe) id: string) {
    return this.service.getSubscription(id);
  }

  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  cancelSubscription(@Param('id', ParseCuidPipe) id: string) {
    return this.service.cancelSubscription(id);
  }

  @Post('subscriptions/:id/change-plan')
  @ApiOperation({ summary: 'Change a subscription plan' })
  changePlan(@Param('id', ParseCuidPipe) id: string, @Body() dto: { planId: string }) {
    return this.service.changePlan(id, dto.planId);
  }

  @Post('subscriptions/:id/pay')
  @ApiOperation({ summary: 'Start a payment for a subscription' })
  startPayment(@Param('id', ParseCuidPipe) id: string) {
    return this.service.startPayment(id);
  }

  @Post('webhooks/money-fusion')
  @ApiOperation({ summary: 'Money Fusion webhook endpoint' })
  @Public()
  async webhook(@Query() query: WebhookQueryDto, @Body() body: any) {
    const payload = JSON.stringify(body ?? {});
    return this.service.handleWebhook(
      'MONEY_FUSION',
      body?.event ?? 'payment',
      payload,
      query.signature,
    );
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'List received webhook events' })
  @Roles(RoleEnum.SUPER_ADMIN)
  listWebhookEvents() {
    return this.service.listWebhookEvents();
  }
}
