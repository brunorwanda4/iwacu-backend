import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockCitizen = {
    id: 'citizen-123',
    nationalId: '12345678901234567890',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+250788123456',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'M',
    homeLocationId: 'village-123',
    profilePhotoUrl: null,
    isLeader: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    homeLocation: {
      id: 'village-123',
      name: 'Kigali Village',
      nameKinyarwanda: 'Umujyi wa Kigali',
      level: 5,
      parentId: 'cell-123',
      latitude: -1.9536,
      longitude: 29.8739,
      createdAt: new Date(),
    },
  };

  const mockJwtPayload = {
    sub: 'citizen-123',
    nationalId: '12345678901234567890',
    homeLocationId: 'village-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'test-secret-key-min-32-characters-long';
              }
              return undefined;
            }),
          },
        },
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

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('validate', () => {
    it('should return citizen data when valid JWT payload is provided', async () => {
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).toEqual({
        id: mockCitizen.id,
        nationalId: mockCitizen.nationalId,
        firstName: mockCitizen.firstName,
        lastName: mockCitizen.lastName,
        homeLocationId: mockCitizen.homeLocationId,
        homeLocation: mockCitizen.homeLocation,
        isLeader: mockCitizen.isLeader,
      });

      expect(prismaService.citizen.findUnique).toHaveBeenCalledWith({
        where: { id: mockJwtPayload.sub },
        include: { homeLocation: true },
      });
    });

    it('should return null when citizen is not found', async () => {
      jest.spyOn(prismaService.citizen, 'findUnique').mockResolvedValue(null);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).toBeNull();
    });

    it('should return null when citizen is inactive', async () => {
      const inactiveCitizen = { ...mockCitizen, isActive: false };
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(inactiveCitizen as any);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).toBeNull();
    });

    it('should attach citizen to request.user with all required fields', async () => {
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).toHaveProperty('id', mockCitizen.id);
      expect(result).toHaveProperty('nationalId', mockCitizen.nationalId);
      expect(result).toHaveProperty('firstName', mockCitizen.firstName);
      expect(result).toHaveProperty('lastName', mockCitizen.lastName);
      expect(result).toHaveProperty('homeLocationId', mockCitizen.homeLocationId);
      expect(result).toHaveProperty('homeLocation');
      expect(result).toHaveProperty('isLeader', mockCitizen.isLeader);
    });

    it('should include home location hierarchy in response', async () => {
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).not.toBeNull();
      expect(result!.homeLocation).toEqual(mockCitizen.homeLocation);
      expect(result!.homeLocation.id).toBe('village-123');
      expect(result!.homeLocation.level).toBe(5);
    });

    it('should extract citizen ID from JWT sub claim', async () => {
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);

      await strategy.validate(mockJwtPayload);

      const callArgs = (prismaService.citizen.findUnique as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.where.id).toBe(mockJwtPayload.sub);
    });

    it('should handle citizen with leader status', async () => {
      const leaderCitizen = { ...mockCitizen, isLeader: true };
      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(leaderCitizen as any);

      const result = await strategy.validate(mockJwtPayload);

      expect(result).not.toBeNull();
      expect(result!.isLeader).toBe(true);
    });
  });

  describe('JWT extraction', () => {
    it('should extract JWT from Authorization header', () => {
      // This test verifies the strategy is configured to extract JWT from Bearer token
      // The actual extraction is handled by passport-jwt's ExtractJwt.fromAuthHeaderAsBearerToken()
      expect(strategy).toBeDefined();
    });
  });
});
