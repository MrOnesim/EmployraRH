import { Module } from '@nestjs/common';
import { EmployeeVaultService } from './employee-vault.service';
import { EmployeeVaultController } from './employee-vault.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [EmployeeVaultController],
  providers: [EmployeeVaultService],
  exports: [EmployeeVaultService],
})
export class EmployeeVaultModule {}
