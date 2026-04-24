export class LeaderInfoDto {
  id: string;
  title: string;
  citizen: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export class LocationInfoDto {
  id: string;
  name: string;
  level: number;
}

export class AnnouncementDto {
  id: string;
  title: string;
  body: string;
  category: string;
  isUrgent: boolean;
  viewCount: number;
  scheduledAt?: Date;
  expiresAt?: Date;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  leader?: LeaderInfoDto;
  location?: LocationInfoDto;
}

export class CreateAnnouncementDto {
  title: string;
  body: string;
  category: string;
  isUrgent?: boolean;
  locationId: string;
  scheduledAt?: Date;
  expiresAt?: Date;
  attachmentUrl?: string;
}

export class PaginatedAnnouncementsDto {
  data: AnnouncementDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
