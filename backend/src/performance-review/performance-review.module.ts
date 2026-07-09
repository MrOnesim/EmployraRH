import { Module } from '@nestjs/common';
import { PerformanceReviewService } from './performance-review.service';
import { PerformanceReviewController } from './performance-review.controller';

@Module({
  controllers: [PerformanceReviewController],
  providers: [PerformanceReviewService],
  exports: [PerformanceReviewService],
})
export class PerformanceReviewModule {}
