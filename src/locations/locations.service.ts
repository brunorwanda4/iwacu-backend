import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationWithParentsDto, LocationWithDistanceDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get location with full parent chain (village → province)
   * Recursively fetches all parent locations up to the root (province)
   * Requirements: 3, 10
   */
  async getLocationWithHierarchy(locationId: string): Promise<LocationWithParentsDto> {
    const locationData = await this.prisma.location.findUnique({
      where: { id: locationId },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: {
                      include: {
                        parent: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!locationData) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    return this.buildLocationHierarchy(locationData);
  }

  /**
   * Get all ancestor IDs for a location (recursively walk up the tree)
   * Returns array of all ancestor IDs including the location itself
   * Example: [villageId, cellId, sectorId, districtId, provinceId]
   * Requirements: 3, 10
   */
  async getAncestorIds(locationId: string): Promise<string[]> {
    const ancestorIds: string[] = [];
    let currentLocationId: string | null = locationId;

    while (currentLocationId) {
      ancestorIds.push(currentLocationId);

      const locationData: { parentId: string | null } | null = await this.prisma.location.findUnique({
        where: { id: currentLocationId },
        select: { parentId: true },
      });

      if (!locationData) {
        throw new NotFoundException(`Location with ID ${currentLocationId} not found`);
      }

      currentLocationId = locationData.parentId;
    }

    return ancestorIds;
  }

  /**
   * Find nearest village by GPS coordinates using Haversine distance formula
   * Returns the closest village with full parent chain and distance
   * Throws error if no village found within 50 km
   * Requirements: 10
   */
  async getNearestLocationWithDistance(lat: number, lng: number): Promise<LocationWithDistanceDto> {
    // Validate GPS coordinates
    if (lat < -90 || lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    // Query all villages (level 5) with GPS coordinates
    const villages = await this.prisma.location.findMany({
      where: {
        level: 5,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: {
                      include: {
                        parent: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (villages.length === 0) {
      throw new NotFoundException('No villages with GPS coordinates found');
    }

    // Calculate distance for each village using Haversine formula
    const villagesWithDistance = villages.map((village) => {
      const distance = this.calculateHaversineDistance(
        lat,
        lng,
        village.latitude!,
        village.longitude!,
      );
      return { village, distance };
    });

    // Find village with minimum distance
    const nearest = villagesWithDistance.reduce((prev, current) =>
      current.distance < prev.distance ? current : prev,
    );

    // Check if nearest village is within 50 km
    if (nearest.distance > 50) {
      throw new NotFoundException(
        `No village found within 50 km. Nearest village is ${nearest.distance.toFixed(2)} km away`,
      );
    }

    return {
      ...this.buildLocationHierarchy(nearest.village),
      distance: parseFloat(nearest.distance.toFixed(2)),
    };
  }

  /**
   * Get all villages within a specified radius from GPS coordinates
   * Requirements: 10
   */
  async getLocationsWithinRadius(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<LocationWithDistanceDto[]> {
    // Validate GPS coordinates
    if (lat < -90 || lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }
    if (radiusKm <= 0) {
      throw new BadRequestException('Radius must be greater than 0');
    }

    // Query all villages (level 5) with GPS coordinates
    const villages = await this.prisma.location.findMany({
      where: {
        level: 5,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: {
                      include: {
                        parent: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate distance for each village and filter by radius
    const villagesWithinRadius = villages
      .map((village) => {
        const distance = this.calculateHaversineDistance(
          lat,
          lng,
          village.latitude!,
          village.longitude!,
        );
        return { village, distance };
      })
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((item) => ({
        ...this.buildLocationHierarchy(item.village),
        distance: parseFloat(item.distance.toFixed(2)),
      }));

    return villagesWithinRadius;
  }

  /**
   * Get all locations at a specific hierarchy level
   * Requirements: 10
   */
  async getLocationsByLevel(level: number): Promise<LocationWithParentsDto[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Location level must be between 1 and 5');
    }

    const locations = await this.prisma.location.findMany({
      where: { level },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: {
                      include: {
                        parent: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return locations.map((location) => this.buildLocationHierarchy(location));
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in kilometers
   * Formula: a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
   *          c = 2 × atan2(√a, √(1−a))
   *          d = R × c (R = 6371 km)
   */
  private calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Build location hierarchy object from nested location data
   * Recursively constructs the parent chain
   */
  private buildLocationHierarchy(location: {
    id: string;
    name: string;
    nameKinyarwanda?: string | null;
    level: number;
    latitude?: number | null;
    longitude?: number | null;
    parent?: any;
  }): LocationWithParentsDto {
    return {
      id: location.id,
      name: location.name,
      nameKinyarwanda: location.nameKinyarwanda || undefined,
      level: location.level,
      latitude: location.latitude || undefined,
      longitude: location.longitude || undefined,
      parent: location.parent ? this.buildLocationHierarchy(location.parent) : null,
    };
  }
}
