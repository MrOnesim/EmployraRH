import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/validators';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty({ example: 'N3w$ecureP@ssw0rd' })
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
