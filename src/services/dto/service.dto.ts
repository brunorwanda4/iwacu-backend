export class ServiceDepartmentDto {
  id: string;
  name: string;
  nameKinyarwanda?: string;
  description?: string;
  category: string;
  phoneNumber?: string;
  email?: string;
  websiteUrl?: string;
  isActive: boolean;
}

export class CreateServiceRequestDto {
  departmentId: string;
  subject: string;
  body: string;
  priority?: string; // low, normal, high, urgent
  locationId?: string;
}

export class ServiceRequestDto {
  id: string;
  referenceNumber: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  responseText?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  citizen?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  department?: ServiceDepartmentDto;
  location?: {
    id: string;
    name: string;
    level: number;
  };
}

export class UpdateServiceRequestStatusDto {
  status: string;
  responseText?: string;
}

export class PaginatedServiceRequestsDto {
  data: ServiceRequestDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
