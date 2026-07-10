import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/validators';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'N3w$ecureP@ssw0rd' })
  @IsString()
  @IsStrongPassword()
  password: string;
}
