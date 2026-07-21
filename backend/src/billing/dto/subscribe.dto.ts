import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingProvider } from '@prisma/client';

export class SubscribeDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  planId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ enum: BillingProvider, required: false, default: BillingProvider.MONEY_FUSION })
  @IsOptional()
  @IsEnum(BillingProvider)
  provider?: BillingProvider;
}
