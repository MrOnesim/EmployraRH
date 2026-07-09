import { Module } from '@nestjs/common';
import { SalaryTransferService } from './salary-transfer.service';
import { SalaryTransferController } from './salary-transfer.controller';

@Module({
  controllers: [SalaryTransferController],
  providers: [SalaryTransferService],
  exports: [SalaryTransferService],
})
export class SalaryTransferModule {}
