import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { PayslipController } from './payslip.controller';
import { PayslipService } from './payslip.service';
import { SalaryCalculatorService } from './salary-calculator.service';

@Module({
  imports: [PrismaModule, ComplianceModule],
  controllers: [PayslipController],
  providers: [PayslipService, SalaryCalculatorService],
  exports: [PayslipService],
})
export class PayslipModule {}
