import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ServiceDepartmentDto,
  ServiceRequestDto,
  CreateServiceRequestDto,
  UpdateServiceRequestStatusDto,
  PaginatedServiceRequestsDto,
} from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active service departments
   * Requirements: 13
   */
  async getDepartments(): Promise<ServiceDepartmentDto[]> {
    const departments = await this.prisma.serviceDepartment.findMany({
      where: { isActive: true },
    });

    return departments.map((dept) => this.toDepartmentDto(dept));
  }

  /**
   * Create service request with reference number generation
   * Format: IWC-YYYYMMDD-NNNNN
   * Requirements: 11, 12
   */
  async createRequest(
    citizenId: string,
    dto: CreateServiceRequestDto,
  ): Promise<ServiceRequestDto> {
    // Verify department exists
    const department = await this.prisma.serviceDepartment.findUnique({
      where: { id: dto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Service department not found');
    }

    // Generate reference number
    const referenceNumber = await this.generateReferenceNumber();

    // Create service request
    const request = await this.prisma.serviceRequest.create({
      data: {
        citizenId,
        departmentId: dto.departmentId,
        subject: dto.subject,
        body: dto.body,
        priority: dto.priority || 'normal',
        referenceNumber,
        status: 'submitted',
        locationId: dto.locationId,
      },
      include: {
        citizen: true,
        department: true,
        location: true,
      },
    });

    return this.toServiceRequestDto(request);
  }

  /**
   * Get citizen's service requests
   * Requirements: 12
   */
  async getMyRequests(
    citizenId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedServiceRequestsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: { citizenId },
        include: {
          citizen: true,
          department: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.serviceRequest.count({
        where: { citizenId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: requests.map((req) => this.toServiceRequestDto(req)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update service request status
   * Requirements: 12
   */
  async updateRequestStatus(
    requestId: string,
    dto: UpdateServiceRequestStatusDto,
  ): Promise<ServiceRequestDto> {
    // Verify request exists
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    // Validate status transition
    const validStatuses = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    // Update request
    const updatedRequest = await this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        responseText: dto.responseText,
        respondedAt: dto.responseText ? new Date() : undefined,
      },
      include: {
        citizen: true,
        department: true,
        location: true,
      },
    });

    return this.toServiceRequestDto(updatedRequest);
  }

  /**
   * Get request by reference number
   * Requirements: 12
   */
  async getRequestByReference(referenceNumber: string): Promise<ServiceRequestDto> {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { referenceNumber },
      include: {
        citizen: true,
        department: true,
        location: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return this.toServiceRequestDto(request);
  }

  /**
   * Get requests by department
   * Requirements: 12
   */
  async getRequestsByDepartment(
    departmentId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<PaginatedServiceRequestsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const where: any = { departmentId };
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          citizen: true,
          department: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: requests.map((req) => this.toServiceRequestDto(req)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Generate reference number in format IWC-YYYYMMDD-NNNNN
   * Requirements: 11
   */
  private async generateReferenceNumber(): Promise<string> {
    // Get current date in YYYYMMDD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Count existing requests for this date
    const count = await this.prisma.serviceRequest.count({
      where: {
        referenceNumber: {
          startsWith: `IWC-${dateStr}`,
        },
      },
    });

    // Pad count to 5 digits
    const countStr = String(count + 1).padStart(5, '0');

    return `IWC-${dateStr}-${countStr}`;
  }

  /**
   * Convert department to DTO
   */
  private toDepartmentDto(department: any): ServiceDepartmentDto {
    return {
      id: department.id,
      name: department.name,
      nameKinyarwanda: department.nameKinyarwanda || undefined,
      description: department.description || undefined,
      category: department.category,
      phoneNumber: department.phoneNumber || undefined,
      email: department.email || undefined,
      websiteUrl: department.websiteUrl || undefined,
      isActive: department.isActive,
    };
  }

  /**
   * Convert service request to DTO
   */
  private toServiceRequestDto(request: any): ServiceRequestDto {
    return {
      id: request.id,
      referenceNumber: request.referenceNumber,
      subject: request.subject,
      body: request.body,
      status: request.status,
      priority: request.priority,
      responseText: request.responseText || undefined,
      respondedAt: request.respondedAt || undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      citizen: request.citizen
        ? {
            id: request.citizen.id,
            firstName: request.citizen.firstName,
            lastName: request.citizen.lastName,
          }
        : undefined,
      department: request.department ? this.toDepartmentDto(request.department) : undefined,
      location: request.location
        ? {
            id: request.location.id,
            name: request.location.name,
            level: request.location.level,
          }
        : undefined,
    };
  }
}
