import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Rwanda National ID (1 followed by 19 digits)',
    example: '12345678901234567890',
    pattern: '^1\\d{19}$',
  })
  @IsString({ message: 'National ID must be a string' })
  @Matches(/^1\d{19}$/, {
    message: 'National ID must be 1 followed by 19 digits',
  })
  nationalId: string;
}
