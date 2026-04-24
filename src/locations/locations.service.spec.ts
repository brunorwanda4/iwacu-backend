import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: PrismaService,
          useValue: {
            location: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLocationWithHierarchy', () => {
    it('should return location with full parent chain', async () => {
      const mockLocation: any = {
        id: 'village-1',
        name: 'Kigali Village',
        level: 5,
        parent: {
          id: 'cell-1',
          name: 'Kigali Cell',
          level: 4,
          parent: {
            id: 'sector-1',
            name: 'Kigali Sector',
            level: 3,
            parent: {
              id: 'district-1',
              name: 'Gasabo District',
              level: 2,
              parent: {
                id: 'province-1',
                name: 'Kigali City',
                level: 1,
                parent: null,
              },
            },
          },
        },
      };

      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(mockLocation);

      const result = await service.getLocationWithHierarchy('village-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('village-1');
      expect(result.level).toBe(5);
      expect(result.parent?.id).toBe('cell-1');
      expect(result.parent?.parent?.id).toBe('sector-1');
    });

    it('should throw NotFoundException when location does not exist', async () => {
      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(null);

      await expect(service.getLocationWithHierarchy('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAncestorIds', () => {
    it('should return all ancestor IDs from village to province', async () => {
      const mockCalls = [
        { parentId: 'cell-1' },
        { parentId: 'sector-1' },
        { parentId: 'district-1' },
        { parentId: 'province-1' },
        { parentId: null },
      ];

      let callIndex = 0;
      jest.spyOn(prisma.location, 'findUnique').mockImplementation(async () => {
        const result = mockCalls[callIndex];
        callIndex++;
        return result as any;
      } as any);

      const result = await service.getAncestorIds('village-1');

      expect(result).toEqual(['village-1', 'cell-1', 'sector-1', 'district-1', 'province-1']);
    });

    it('should throw NotFoundException when location does not exist', async () => {
      jest.spyOn(prisma.location, 'findUnique').mockResolvedValue(null);

      await expect(service.getAncestorIds('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getNearestLocationWithDistance', () => {
    it('should find nearest village within 50 km', async () => {
      const mockVillage: any = {
        id: 'village-1',
        name: 'Kigali Village',
        level: 5,
        latitude: -1.9536,
        longitude: 29.8739,
        parent: null,
      };

      jest.spyOn(prisma.location, 'findMany').mockResolvedValue([mockVillage]);

      const result = await service.getNearestLocationWithDistance(-1.9536, 29.8739);

      expect(result).toBeDefined();
      expect(result.id).toBe('village-1');
      expect(result.distance).toBeDefined();
    });

    it('should throw NotFoundException when no villages found', async () => {
      jest.spyOn(prisma.location, 'findMany').mockResolvedValue([]);

      await expect(
        service.getNearestLocationWithDistance(-1.9536, 29.8739),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid latitude', async () => {
      await expect(
        service.getNearestLocationWithDistance(91, 29.8739),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid longitude', async () => {
      await expect(
        service.getNearestLocationWithDistance(-1.9536, 181),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLocationsWithinRadius', () => {
    it('should return villages within specified radius', async () => {
      const mockVillages: any[] = [
        {
          id: 'village-1',
          name: 'Village 1',
          level: 5,
          latitude: -1.9536,
          longitude: 29.8739,
          parent: null,
        },
        {
          id: 'village-2',
          name: 'Village 2',
          level: 5,
          latitude: -1.9537,
          longitude: 29.8740,
          parent: null,
        },
      ];

      jest.spyOn(prisma.location, 'findMany').mockResolvedValue(mockVillages);

      const result = await service.getLocationsWithinRadius(-1.9536, 29.8739, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw BadRequestException for invalid radius', async () => {
      await expect(
        service.getLocationsWithinRadius(-1.9536, 29.8739, 0),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLocationsByLevel', () => {
    it('should return locations at specified level', async () => {
      const mockLocations: any[] = [
        {
          id: 'village-1',
          name: 'Village 1',
          level: 5,
          parent: null,
        },
        {
          id: 'village-2',
          name: 'Village 2',
          level: 5,
          parent: null,
        },
      ];

      jest.spyOn(prisma.location, 'findMany').mockResolvedValue(mockLocations);

      const result = await service.getLocationsByLevel(5);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should throw BadRequestException for invalid level', async () => {
      await expect(service.getLocationsByLevel(0)).rejects.toThrow(BadRequestException);
      await expect(service.getLocationsByLevel(6)).rejects.toThrow(BadRequestException);
    });
  });
});
