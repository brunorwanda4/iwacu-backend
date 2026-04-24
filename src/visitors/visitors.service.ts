import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VisitorRegistrationDto,
  RegisterVisitorDto,
  CheckOutDto,
  PaginatedVisitorRegistrationsDto,
} from './dto/visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register a new visitor
   * Requirements: 14
   */
  async registerVisitor(
    hostCitizenId: string,
    dto: RegisterVisitorDto,
  ): Promise<VisitorRegistrationDto> {
    // Verify host citizen exists
    const host = await this.prisma.citizen.findUnique({
      where: { id: hostCitizenId },
    });

    if (!host) {
      throw new NotFoundException('Host citizen not found');
    }

    // Verify location exists
    const location = await this.prisma.location.findUnique({
      where: { id: dto.locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Create visitor registration
    const registration = await this.prisma.visitorRegistration.create({
      data: {
        hostCitizenId,
        visitorName: dto.visitorName,
        visitorNationalId: dto.visitorNationalId,
        visitorPhone: dto.visitorPhone,
        purposeOfVisit: dto.purposeOfVisit,
        arrivalDate: new Date(dto.arrivalDate),
        expectedDepartureDate: dto.expectedDepartureDate
          ? new Date(dto.expectedDepartureDate)
          : undefined,
        locationId: dto.locationId,
        notes: dto.notes,
      },
      include: {
        host: true,
        location: true,
      },
    });

    return this.toVisitorRegistrationDto(registration);
  }

  /**
   * Check out visitor
   * Requirements: 15
   */
  async checkOutVisitor(
    registrationId: string,
    dto: CheckOutDto,
  ): Promise<VisitorRegistrationDto> {
    // Verify registration exists
    const registration = await this.prisma.visitorRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Visitor registration not found');
    }

    if (registration.isDeparted) {
      throw new BadRequestException('Visitor has already checked out');
    }

    // Update registration with checkout time
    const updatedRegistration = await this.prisma.visitorRegistration.update({
      where: { id: registrationId },
      data: {
        actualDepartureDate: new Date(dto.actualDepartureDate),
        isDeparted: true,
      },
      include: {
        host: true,
        location: true,
      },
    });

    return this.toVisitorRegistrationDto(updatedRegistration);
  }

  /**
   * Get active visitors in a village
   * Requirements: 14, 15
   */
  async getActiveVisitors(
    villageId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const [registrations, total] = await Promise.all([
      this.prisma.visitorRegistration.findMany({
        where: {
          locationId: villageId,
          isDeparted: false,
        },
        include: {
          host: true,
          location: true,
        },
        orderBy: { arrivalDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.visitorRegistration.count({
        where: {
          locationId: villageId,
          isDeparted: false,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: registrations.map((reg) => this.toVisitorRegistrationDto(reg)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get visitor history for a homeowner
   * Requirements: 14, 15
   */
  async getVisitorHistory(
    hostCitizenId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const [registrations, total] = await Promise.all([
      this.prisma.visitorRegistration.findMany({
        where: { hostCitizenId },
        include: {
          host: true,
          location: true,
        },
        orderBy: { arrivalDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.visitorRegistration.count({
        where: { hostCitizenId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: registrations.map((reg) => this.toVisitorRegistrationDto(reg)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get visitors by village
   * Requirements: 14, 15
   */
  async getVisitorsByVillage(
    villageId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const [registrations, total] = await Promise.all([
      this.prisma.visitorRegistration.findMany({
        where: { locationId: villageId },
        include: {
          host: true,
          location: true,
        },
        orderBy: { arrivalDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.visitorRegistration.count({
        where: { locationId: villageId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: registrations.map((reg) => this.toVisitorRegistrationDto(reg)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Convert visitor registration to DTO
   */
  private toVisitorRegistrationDto(registration: any): VisitorRegistrationDto {
    return {
      id: registration.id,
      visitorName: registration.visitorName,
      visitorNationalId: registration.visitorNationalId || undefined,
      visitorPhone: registration.visitorPhone || undefined,
      purposeOfVisit: registration.purposeOfVisit || undefined,
      arrivalDate: registration.arrivalDate,
      expectedDepartureDate: registration.expectedDepartureDate || undefined,
      actualDepartureDate: registration.actualDepartureDate || undefined,
      isDeparted: registration.isDeparted,
      notes: registration.notes || undefined,
      createdAt: registration.createdAt,
      host: registration.host
        ? {
            id: registration.host.id,
            firstName: registration.host.firstName,
            lastName: registration.host.lastName,
          }
        : undefined,
      location: registration.location
        ? {
            id: registration.location.id,
            name: registration.location.name,
            level: registration.location.level,
          }
        : undefined,
    };
  }
}
