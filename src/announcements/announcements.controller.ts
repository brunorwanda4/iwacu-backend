import { Controller, Get, Post, Patch, Query, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import {
  AnnouncementDto,
  CreateAnnouncementDto,
  PaginatedAnnouncementsDto,
} from './dto/announcement.dto';
import { Request } from 'express';

@ApiTags('Announcements')
@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  /**
   * Get announcements for citizen's location (village → province)
   * Returns hierarchical announcements with pagination
   * Requirements: 8, 9
   */
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get announcements for location',
    description:
      'Retrieve announcements from the specified location and all parent locations (village to province) with pagination',
  })
  @ApiQuery({
    name: 'locationId',
    required: true,
    description: 'Location ID to get announcements for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
    type: PaginatedAnnouncementsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found',
  })
  async getAnnouncementsForLocation(
    @Query('locationId') locationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedAnnouncementsDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.announcementsService.getAnnouncementsForLocation(locationId, pageNum, limitNum);
  }

  /**
   * Create announcement (leader only)
   * Verifies leader has authority at specified location
   * Requirements: 7
   */
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create announcement',
    description: 'Create a new announcement (leader only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
    type: AnnouncementDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or leader does not have authority',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Leader or location not found',
  })
  async createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @Req() request: Request,
  ): Promise<AnnouncementDto> {
    const leaderId = (request.user as any)?.leaderId;
    if (!leaderId) {
      throw new Error('User is not a leader');
    }
    return this.announcementsService.createAnnouncement(leaderId, dto);
  }

  /**
   * Increment view count for announcement
   * Requirements: 8
   */
  @Patch(':id/view')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Increment announcement view count',
    description: 'Increment the view count for an announcement',
  })
  @ApiResponse({
    status: 200,
    description: 'View count incremented successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found',
  })
  async incrementViewCount(@Param('id') announcementId: string): Promise<{ success: boolean }> {
    await this.announcementsService.incrementViewCount(announcementId);
    return { success: true };
  }

  /**
   * Get announcement by ID
   */
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get announcement by ID',
    description: 'Retrieve a specific announcement by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcement retrieved successfully',
    type: AnnouncementDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Announcement not found',
  })
  async getAnnouncementById(@Param('id') announcementId: string): Promise<AnnouncementDto> {
    return this.announcementsService.getAnnouncementById(announcementId);
  }
}
