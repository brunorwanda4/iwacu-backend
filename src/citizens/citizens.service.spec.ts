import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CitizensService', () => {
  let service: CitizensService;
  let prisma: PrismaService;

  const mockLocation = {
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

  const mockCitizen = {
    id: 'citizen-1',
    nationalId: '11234567890123456789',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+250788123456',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'M',
    homeLocationId: 'village-1',
    profilePhotoUrl: null,
    isLeader: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    homeLocation: mockLocation,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitizensService,
        {
          provide: PrismaService,
          useValue: {
            citizen: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CitizensService>(CitizensService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getMe', () => {
    it('should return citizen with full location hierarchy', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      const result = await service.getMe('citizen-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('citizen-1');
      expect(result.nationalId).toBe('11234567890123456789');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.homeLocation).toBeDefined();
      expect(result.homeLocation!.level).toBe(5);
      expect(result.homeLocation!.parent).toBeDefined();
      expect(result.homeLocation!.parent!.level).toBe(4);
      expect(result.homeLocation!.parent!.parent).toBeDefined();
      expect(result.homeLocation!.parent!.parent!.level).toBe(3);
      expect(result.homeLocation!.parent!.parent!.parent).toBeDefined();
      expect(result.homeLocation!.parent!.parent!.parent!.level).toBe(2);
      expect(result.homeLocation!.parent!.parent!.parent!.parent).toBeDefined();
      expect(result.homeLocation!.parent!.parent!.parent!.parent!.level).toBe(1);
    });

    it('should throw NotFoundException when citizen not found', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use nested include to fetch full location hierarchy', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      await service.getMe('citizen-1');

      expect(prisma.citizen.findUnique).toHaveBeenCalledWith({
        where: { id: 'citizen-1' },
        include: {
          homeLocation: {
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
          },
        },
      });
    });
  });

  describe('getCitizenByNationalId', () => {
    it('should return citizen by national ID', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      const result = await service.getCitizenByNationalId('11234567890123456789');

      expect(result).toBeDefined();
      expect(result.nationalId).toBe('11234567890123456789');
      expect(result.homeLocation).toBeDefined();
    });

    it('should throw NotFoundException when citizen not found', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getCitizenByNationalId('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should query by nationalId with homeLocation included', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      await service.getCitizenByNationalId('11234567890123456789');

      expect(prisma.citizen.findUnique).toHaveBeenCalledWith({
        where: { nationalId: '11234567890123456789' },
        include: { homeLocation: true },
      });
    });
  });

  describe('getCitizenById', () => {
    it('should return citizen by ID', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      const result = await service.getCitizenById('citizen-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('citizen-1');
      expect(result.homeLocation).toBeDefined();
    });

    it('should throw NotFoundException when citizen not found', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(null);

      await expect(service.getCitizenById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should query by ID with homeLocation included', async () => {
      jest.spyOn(prisma.citizen, 'findUnique').mockResolvedValue(mockCitizen);

      await service.getCitizenById('citizen-1');

      expect(prisma.citizen.findUnique).toHaveBeenCalledWith({
        where: { id: 'citizen-1' },
        include: { homeLocation: true },
      });
    });
  });
});
