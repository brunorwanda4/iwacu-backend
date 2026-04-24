export class LocationDto {
  id: string;
  name: string;
  nameKinyarwanda?: string;
  level: number; // 1=Province, 2=District, 3=Sector, 4=Cell, 5=Village
  latitude?: number;
  longitude?: number;
}

export class LocationWithParentsDto extends LocationDto {
  parent?: LocationWithParentsDto | null;
}

export class LocationWithDistanceDto extends LocationWithParentsDto {
  distance: number; // Distance in kilometers
}
