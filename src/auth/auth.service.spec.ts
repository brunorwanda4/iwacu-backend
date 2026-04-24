import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CitizensService } from '../citizens/citizens.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let citizensService: CitizensService;

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

  const mockCitizenDto = {
    id: 'citizen-123',
    nationalId: '12345678901234567890',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+250788123456',
    isLeader: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            citizen: {
              findUnique: jest.fn(),
            },
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: CitizensService,
          useValue: {
            toCitizenDto: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    citizensService = module.get<CitizensService>(CitizensService);
  });

  describe('login', () => {
    it('should successfully login with valid National ID', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      const result = await service.login(loginDto, 'device-123', '192.168.1.1');

      expect(result).toEqual({
        accessToken,
        refreshToken,
        citizen: mockCitizenDto,
      });

      expect(prismaService.citizen.findUnique).toHaveBeenCalledWith({
        where: { nationalId: loginDto.nationalId },
        include: { homeLocation: true },
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: mockCitizen.id,
        nationalId: mockCitizen.nationalId,
        homeLocationId: mockCitizen.homeLocationId,
      });

      expect(jwtService.sign).toHaveBeenNthCalledWith(2, {
        sub: mockCitizen.id,
        type: 'refresh',
      }, { expiresIn: '7d' });

      expect(prismaService.session.create).toHaveBeenCalled();
      const createCall = (prismaService.session.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.citizenId).toBe(mockCitizen.id);
      expect(createCall.data.refreshToken).toBe(refreshToken);
      expect(createCall.data.deviceInfo).toBe('device-123');
      expect(createCall.data.ipAddress).toBe('192.168.1.1');
      expect(createCall.data.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw UnauthorizedException when citizen not found', async () => {
      const loginDto: LoginDto = {
        nationalId: '99999999999999999999',
      };

      jest.spyOn(prismaService.citizen, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid National ID or citizen not found');
    });

    it('should generate access token with 15-minute expiry', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      await service.login(loginDto);

      // First call should be for access token (no expiresIn override = uses default 15m)
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: mockCitizen.id,
        nationalId: mockCitizen.nationalId,
        homeLocationId: mockCitizen.homeLocationId,
      });
    });

    it('should generate refresh token with 7-day expiry', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      await service.login(loginDto);

      // Second call should be for refresh token with 7d expiry
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, {
        sub: mockCitizen.id,
        type: 'refresh',
      }, { expiresIn: '7d' });
    });

    it('should include required claims in access token', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      await service.login(loginDto);

      const accessTokenPayload = (jwtService.sign as jest.Mock).mock.calls[0][0];
      expect(accessTokenPayload).toHaveProperty('sub', mockCitizen.id);
      expect(accessTokenPayload).toHaveProperty('nationalId', mockCitizen.nationalId);
      expect(accessTokenPayload).toHaveProperty('homeLocationId', mockCitizen.homeLocationId);
    });

    it('should store refresh token in sessions table with device and IP info', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };
      const deviceInfo = 'iPhone 14 Pro';
      const ipAddress = '192.168.1.100';

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      await service.login(loginDto, deviceInfo, ipAddress);

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: {
          citizenId: mockCitizen.id,
          refreshToken: 'refresh-token',
          deviceInfo,
          ipAddress,
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should return citizen information in response', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest
        .spyOn(prismaService.citizen, 'findUnique')
        .mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.session, 'create').mockResolvedValue({} as any);
      jest.spyOn(citizensService, 'toCitizenDto').mockReturnValue(mockCitizenDto as any);

      const result = await service.login(loginDto);

      expect(result.citizen).toEqual(mockCitizenDto);
      expect(citizensService.toCitizenDto).toHaveBeenCalledWith(mockCitizen);
    });
  });

  describe('refresh', () => {
    it('should generate new access token with valid refresh token', async () => {
      const refreshDto = { refreshToken: 'valid-refresh-token' };
      const newAccessToken = 'new-access-token';

      const mockSession = {
        id: 'session-123',
        citizenId: mockCitizen.id,
        refreshToken: 'valid-refresh-token',
        deviceInfo: 'device-123',
        ipAddress: '192.168.1.1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        lastUsedAt: null,
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue({} as any);
      jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(mockSession as any);
      jest.spyOn(prismaService.citizen, 'findUnique').mockResolvedValue(mockCitizen as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(newAccessToken);
      jest.spyOn(prismaService.session, 'update').mockResolvedValue({} as any);

      const result = await service.refresh(refreshDto);

      expect(result).toEqual({ accessToken: newAccessToken });
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw UnauthorizedException with expired refresh token', async () => {
      const refreshDto = { refreshToken: 'expired-refresh-token' };

      const mockExpiredSession = {
        id: 'session-123',
        citizenId: mockCitizen.id,
        refreshToken: 'expired-refresh-token',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue({} as any);
      jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(mockExpiredSession as any);

      await expect(service.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete session with given refresh token', async () => {
      const refreshToken = 'refresh-token-123';

      jest.spyOn(prismaService.session, 'deleteMany').mockResolvedValue({ count: 1 } as any);

      await service.logout(refreshToken);

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken },
      });
    });
  });

  describe('validateToken', () => {
    it('should verify and return token payload', async () => {
      const token = 'valid-token';
      const payload = { sub: 'citizen-123', nationalId: '12345678901234567890' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload as any);

      const result = await service.validateToken(token);

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException with invalid token', async () => {
      const token = 'invalid-token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });
});
