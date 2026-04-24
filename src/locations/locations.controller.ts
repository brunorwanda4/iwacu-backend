import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocationsService } from './locations.service';
import { LocationWithParentsDto, LocationWithDistanceDto } from './dto/location.dto';
import { Request } from 'express';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  /**
   * Get nearest village by GPS coordinates
   * GET /locations/nearest?lat=<latitude>&lng=<longitude>
   * Requirements: 10
   */
  @Get('nearest')
  async getNearestLocation(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<LocationWithDistanceDto> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return this.locationsService.getNearestLocationWithDistance(latitude, longitude);
  }

  /**
   * Get all villages within radius
   * GET /locations/within-radius?lat=<latitude>&lng=<longitude>&radius=<radiusKm>
   * Requirements: 10
   */
  @Get('within-radius')
  async getLocationsWithinRadius(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ): Promise<LocationWithDistanceDto[]> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    return this.locationsService.getLocationsWithinRadius(latitude, longitude, radiusKm);
  }

  /**
   * Get locations by level
   * GET /locations/by-level?level=<level>
   * Requirements: 10
   */
  @Get('by-level')
  async getLocationsByLevel(@Query('level') level: string): Promise<LocationWithParentsDto[]> {
    const locationLevel = parseInt(level, 10);
    return this.locationsService.getLocationsByLevel(locationLevel);
  }

  /**
   * Get location with full parent chain (village → province)
   * GET /locations/:id
   */
  @Get(':id')
  async getLocationWithHierarchy(
    @Req() request: Request,
  ): Promise<LocationWithParentsDto> {
    const locationId = (request.params as any).id;
    return this.locationsService.getLocationWithHierarchy(locationId);
  }

  /**
   * Get all ancestor IDs for a location
   * GET /locations/:id/ancestors
   */
  @Get(':id/ancestors')
  async getAncestorIds(@Req() request: Request): Promise<{ ancestorIds: string[] }> {
    const locationId = (request.params as any).id;
    const ancestorIds = await this.locationsService.getAncestorIds(locationId);
    return { ancestorIds };
  }
}
