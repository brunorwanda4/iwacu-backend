import { ApiProperty } from '@nestjs/swagger';
import type { CitizenDto } from '../../citizens/dto/citizen.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token (15-minute expiration)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token (7-day expiration)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Authenticated citizen information',
    type: 'object',
  })
  citizen!: CitizenDto;
}
