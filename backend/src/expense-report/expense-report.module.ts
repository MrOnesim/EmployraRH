import { Module } from '@nestjs/common';
import { ExpenseReportService } from './expense-report.service';
import { ExpenseReportController } from './expense-report.controller';

@Module({
  controllers: [ExpenseReportController],
  providers: [ExpenseReportService],
  exports: [ExpenseReportService],
})
export class ExpenseReportModule {}
