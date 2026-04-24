import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderDto, UpdateLeaderContactDto } from './dto/leader.dto';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class LeadersService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
  ) {}

  /**
   * Get all leaders from village to province for a location
   * Walks up the location tree and returns leaders at each level
   * Requirements: 5, 6
   */
  async getLeadersForLocation(locationId: string): Promise<LeaderDto[]> {
    // Get all ancestor location IDs (including the location itself)
    const ancestorIds = await this.locationsService.getAncestorIds(locationId);

    // Query leaders for all ancestor locations
    const leaders = await this.prisma.leader.findMany({
      where: {
        locationId: {
          in: ancestorIds,
        },
      },
      include: {
        citizen: true,
        location: true,
      },
    });

    // Sort leaders by location level (village to province)
    const sortedLeaders = leaders.sort((a, b) => b.location.level - a.location.level);

    return sortedLeaders.map((leader) => this.toLeaderDto(leader));
  }

  /**
   * Get leader at specific level for a location
   * Walks up the tree until finding a leader at the specified level
   * Requirements: 5, 6
   */
  async getLeaderAtLevel(locationId: string, level: number): Promise<LeaderDto | null> {
    const ancestorIds = await this.locationsService.getAncestorIds(locationId);

    // Get all locations in the ancestor chain
    const locations = await this.prisma.location.findMany({
      where: {
        id: {
          in: ancestorIds,
        },
      },
    });

    // Find location at the specified level
    const targetLocation = locations.find((loc) => loc.level === level);
    if (!targetLocation) {
      return null;
    }

    // Get leader at that location
    const leader = await this.prisma.leader.findUnique({
      where: { locationId: targetLocation.id },
      include: {
        citizen: true,
        location: true,
      },
    });

    return leader ? this.toLeaderDto(leader) : null;
  }

  /**
   * Assign citizen as leader to location
   * Verifies citizen exists and is not already a leader at that location
   * Requirements: 5
   */
  async assignLeader(
    citizenId: string,
    locationId: string,
    title: string,
  ): Promise<LeaderDto> {
    // Verify citizen exists
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
    });

    if (!citizen) {
      throw new NotFoundException('Citizen not found');
    }

    // Verify location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Check if citizen is already a leader at this location
    const existingLeader = await this.prisma.leader.findUnique({
      where: { locationId },
    });

    if (existingLeader) {
      throw new BadRequestException('A leader is already assigned to this location');
    }

    // Create leader assignment
    const leader = await this.prisma.leader.create({
      data: {
        citizenId,
        locationId,
        title,
        appointedAt: new Date(),
      },
      include: {
        citizen: true,
        location: true,
      },
    });

    // Update citizen's isLeader flag
    await this.prisma.citizen.update({
      where: { id: citizenId },
      data: { isLeader: true },
    });

    return this.toLeaderDto(leader);
  }

  /**
   * Update leader contact information
   * Validates phone number format (+250 followed by 9 digits)
   * Requirements: 6
   */
  async updateLeaderContact(
    leaderId: string,
    dto: UpdateLeaderContactDto,
  ): Promise<LeaderDto> {
    // Verify leader exists
    const leader = await this.prisma.leader.findUnique({
      where: { id: leaderId },
    });

    if (!leader) {
      throw new NotFoundException('Leader not found');
    }

    // Validate phone number format if provided
    if (dto.phoneNumber) {
      const phoneRegex = /^\+250\d{9}$/;
      if (!phoneRegex.test(dto.phoneNumber)) {
        throw new BadRequestException(
          'Invalid phone number format. Expected: +250 followed by 9 digits',
        );
      }
    }

    // Update leader contact information
    const updatedLeader = await this.prisma.leader.update({
      where: { id: leaderId },
      data: {
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        officeAddress: dto.officeAddress,
        officeLongitude: dto.officeLongitude,
        officeLatitude: dto.officeLatitude,
      },
      include: {
        citizen: true,
        location: true,
      },
    });

    return this.toLeaderDto(updatedLeader);
  }

  /**
   * Convert leader to DTO
   */
  private toLeaderDto(leader: any): LeaderDto {
    return {
      id: leader.id,
      title: leader.title,
      phoneNumber: leader.phoneNumber || undefined,
      email: leader.email || undefined,
      officeAddress: leader.officeAddress || undefined,
      officeLatitude: leader.officeLatitude || undefined,
      officeLongitude: leader.officeLongitude || undefined,
      citizen: {
        id: leader.citizen.id,
        nationalId: leader.citizen.nationalId,
        firstName: leader.citizen.firstName,
        lastName: leader.citizen.lastName,
      },
      location: {
        id: leader.location.id,
        name: leader.location.name,
        level: leader.location.level,
      },
    };
  }
}
