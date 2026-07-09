import { Module } from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { ObjectiveController } from './objective.controller';

@Module({
  controllers: [ObjectiveController],
  providers: [ObjectiveService],
  exports: [ObjectiveService],
})
export class ObjectiveModule {}
