import { Module } from '@nestjs/common';
import { WellnessSurveyService } from './wellness-survey.service';
import { WellnessSurveyController } from './wellness-survey.controller';

@Module({
  controllers: [WellnessSurveyController],
  providers: [WellnessSurveyService],
  exports: [WellnessSurveyService],
})
export class WellnessSurveyModule {}
