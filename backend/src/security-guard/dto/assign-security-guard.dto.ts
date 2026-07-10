import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSecurityGuardDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  companyId: string;
}
