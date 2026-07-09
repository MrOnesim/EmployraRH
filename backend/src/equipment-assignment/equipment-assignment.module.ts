import { Module } from '@nestjs/common';
import { EquipmentAssignmentService } from './equipment-assignment.service';
import { EquipmentAssignmentController } from './equipment-assignment.controller';

@Module({
  controllers: [EquipmentAssignmentController],
  providers: [EquipmentAssignmentService],
  exports: [EquipmentAssignmentService],
})
export class EquipmentAssignmentModule {}
