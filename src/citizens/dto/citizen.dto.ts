import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CitizenDto {
  @ApiProperty({
    description: 'Unique identifier for the citizen',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Rwanda National ID (1 followed by 19 digits)',
    example: '11234567890123456789',
  })
  nationalId: string;

  @ApiProperty({
    description: 'Citizen first name',
    example: 'Jean',
  })
  firstName: string;

  @ApiProperty({
    description: 'Citizen last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Citizen phone number in format +250XXXXXXXXX',
    example: '+250788123456',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Whether the citizen is a government leader',
    example: false,
  })
  isLeader: boolean;
}

export class LocationDto {
  @ApiProperty({
    description: 'Unique identifier for the location',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Kigali Village',
  })
  name: string;

  @ApiProperty({
    description: 'Location hierarchy level (1=Province, 2=District, 3=Sector, 4=Cell, 5=Village)',
    example: 5,
    enum: [1, 2, 3, 4, 5],
  })
  level: number;

  @ApiPropertyOptional({
    description: 'Parent location in the hierarchy (null for provinces)',
    type: LocationDto,
  })
  parent?: LocationDto | null;
}

export class CitizenWithLocationDto {
  @ApiProperty({
    description: 'Unique identifier for the citizen',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Rwanda National ID (1 followed by 19 digits)',
    example: '11234567890123456789',
  })
  nationalId: string;

  @ApiProperty({
    description: 'Citizen first name',
    example: 'Jean',
  })
  firstName: string;

  @ApiProperty({
    description: 'Citizen last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Citizen phone number in format +250XXXXXXXXX',
    example: '+250788123456',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Whether the citizen is a government leader',
    example: false,
  })
  isLeader: boolean;

  @ApiProperty({
    description: 'Citizen home location with full hierarchy chain (village → cell → sector → district → province)',
    type: LocationDto,
  })
  homeLocation: LocationDto | null;
}
