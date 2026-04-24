import { IsString, IsOptional, Matches, IsNumber, Min, Max } from 'class-validator';

export class LeaderDto {
  id: string;
  title: string;
  phoneNumber?: string;
  email?: string;
  officeAddress?: string;
  officeLatitude?: number;
  officeLongitude?: number;
  citizen: {
    id: string;
    nationalId: string;
    firstName: string;
    lastName: string;
  };
  location: {
    id: string;
    name: string;
    level: number;
  };
}

export class UpdateLeaderContactDto {
  @IsOptional()
  @IsString()
  @Matches(/^\+250\d{9}$/, {
    message: 'Phone number must be in format +250 followed by 9 digits',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  officeAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  officeLatitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  officeLongitude?: number;
}

export class AssignLeaderDto {
  @IsString()
  citizenId: string;

  @IsString()
  locationId: string;

  @IsString()
  title: string;
}
