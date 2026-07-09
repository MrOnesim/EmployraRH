import { Module } from '@nestjs/common';
import { WellnessResponseService } from './wellness-response.service';
import { WellnessResponseController } from './wellness-response.controller';

@Module({
  controllers: [WellnessResponseController],
  providers: [WellnessResponseService],
  exports: [WellnessResponseService],
})
export class WellnessResponseModule {}
