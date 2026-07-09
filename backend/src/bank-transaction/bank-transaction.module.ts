import { Module } from '@nestjs/common';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransactionController } from './bank-transaction.controller';

@Module({
  controllers: [BankTransactionController],
  providers: [BankTransactionService],
  exports: [BankTransactionService],
})
export class BankTransactionModule {}
