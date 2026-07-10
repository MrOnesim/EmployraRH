import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMeetingDto } from './create-meeting.dto';

export class UpdateMeetingDto extends PartialType(
  OmitType(CreateMeetingDto, ['companyId']),
) {}
