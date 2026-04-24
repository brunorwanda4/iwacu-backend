import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationsService } from '../locations/locations.service';
import {
  AnnouncementDto,
  CreateAnnouncementDto,
  PaginatedAnnouncementsDto,
} from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
  ) {}

  /**
   * Get announcements for citizen's location (village → province)
   * Returns hierarchical announcements with pagination
   * Requirements: 8, 9
   */
  async getAnnouncementsForLocation(
    locationId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedAnnouncementsDto> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Get all ancestor location IDs (including the location itself)
    const ancestorIds = await this.locationsService.getAncestorIds(locationId);

    // Query announcements for all ancestor locations
    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where: {
          locationId: {
            in: ancestorIds,
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          leader: {
            include: {
              citizen: true,
            },
          },
          location: true,
        },
        orderBy: [
          { isUrgent: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count({
        where: {
          locationId: {
            in: ancestorIds,
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: announcements.map((ann) => this.toAnnouncementDto(ann)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Create announcement (leader only)
   * Verifies leader has authority at specified location
   * Requirements: 7
   */
  async createAnnouncement(
    leaderId: string,
    dto: CreateAnnouncementDto,
  ): Promise<AnnouncementDto> {
    // Verify leader exists
    const leader = await this.prisma.leader.findUnique({
      where: { id: leaderId },
      include: { location: true },
    });

    if (!leader) {
      throw new NotFoundException('Leader not found');
    }

    // Verify leader has authority at the specified location
    if (leader.locationId !== dto.locationId) {
      throw new BadRequestException(
        'Leader does not have authority to post announcements at this location',
      );
    }

    // Create announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        leaderId,
        locationId: dto.locationId,
        title: dto.title,
        body: dto.body,
        category: dto.category,
        isUrgent: dto.isUrgent || false,
        scheduledAt: dto.scheduledAt,
        expiresAt: dto.expiresAt,
        attachmentUrl: dto.attachmentUrl,
      },
      include: {
        leader: {
          include: {
            citizen: true,
          },
        },
        location: true,
      },
    });

    return this.toAnnouncementDto(announcement);
  }

  /**
   * Increment view count for announcement
   * Requirements: 8
   */
  async incrementViewCount(announcementId: string): Promise<void> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId: string): Promise<AnnouncementDto> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        leader: {
          include: {
            citizen: true,
          },
        },
        location: true,
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return this.toAnnouncementDto(announcement);
  }

  /**
   * Convert announcement to DTO
   */
  private toAnnouncementDto(announcement: any): AnnouncementDto {
    return {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      isUrgent: announcement.isUrgent,
      viewCount: announcement.viewCount,
      createdAt: announcement.createdAt,
      expiresAt: announcement.expiresAt || undefined,
      leader: {
        id: announcement.leader.id,
        title: announcement.leader.title,
        citizen: {
          id: announcement.leader.citizen.id,
          firstName: announcement.leader.citizen.firstName,
          lastName: announcement.leader.citizen.lastName,
        },
      },
      location: {
        id: announcement.location.id,
        name: announcement.location.name,
        level: announcement.location.level,
      },
    };
  }
}
