export class RegisterVisitorDto {
  visitorName: string;
  visitorNationalId?: string;
  visitorPhone?: string;
  purposeOfVisit?: string;
  arrivalDate: Date;
  expectedDepartureDate?: Date;
  locationId: string;
  notes?: string;
}

export class VisitorRegistrationDto {
  id: string;
  visitorName: string;
  visitorNationalId?: string;
  visitorPhone?: string;
  purposeOfVisit?: string;
  arrivalDate: Date;
  expectedDepartureDate?: Date;
  actualDepartureDate?: Date;
  isDeparted: boolean;
  notes?: string;
  createdAt: Date;
  host?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  location?: {
    id: string;
    name: string;
    level: number;
  };
}

export class CheckOutDto {
  actualDepartureDate: Date;
}

export class PaginatedVisitorRegistrationsDto {
  data: VisitorRegistrationDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
