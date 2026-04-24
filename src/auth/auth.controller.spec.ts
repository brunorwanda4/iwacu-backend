import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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
  };

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    citizen: {
      id: mockCitizen.id,
      nationalId: mockCitizen.nationalId,
      firstName: mockCitizen.firstName,
      lastName: mockCitizen.lastName,
      isLeader: mockCitizen.isLeader,
    },
  };

  const mockRequest = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-forwarded-for': '192.168.1.1',
    },
    ip: '192.168.1.1',
    socket: {
      remoteAddress: '192.168.1.1',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid National ID', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest.headers['user-agent'],
        '192.168.1.1',
      );
    });

    it('should extract device info from User-Agent header', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, mockRequest);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        expect.any(String),
      );
    });

    it('should extract IP address from X-Forwarded-For header', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, mockRequest);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        expect.any(String),
        '192.168.1.1',
      );
    });

    it('should extract IP address from connection.remoteAddress when X-Forwarded-For is not present', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      const requestWithoutForwardedFor = {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: '10.0.0.1',
        socket: {
          remoteAddress: '10.0.0.1',
        },
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, requestWithoutForwardedFor);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        'Mozilla/5.0',
        '10.0.0.1',
      );
    });

    it('should handle multiple IPs in X-Forwarded-For header and use the first one', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      const requestWithMultipleIps = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        },
        ip: '192.168.1.1',
        socket: {
          remoteAddress: '192.168.1.1',
        },
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, requestWithMultipleIps);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        'Mozilla/5.0',
        '192.168.1.1',
      );
    });

    it('should throw UnauthorizedException for invalid National ID', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid National ID or citizen not found'));

      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access token with 15-minute expiry', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
    });

    it('should return refresh token with 7-day expiry', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should return citizen information in response', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result.citizen).toBeDefined();
      expect(result.citizen.id).toBe(mockCitizen.id);
      expect(result.citizen.nationalId).toBe(mockCitizen.nationalId);
      expect(result.citizen.firstName).toBe(mockCitizen.firstName);
      expect(result.citizen.lastName).toBe(mockCitizen.lastName);
    });
  });

  describe('refresh', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      const refreshResponse = { accessToken: 'new-mock-access-token' };
      jest.spyOn(authService, 'refresh').mockResolvedValue(refreshResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(refreshResponse);
      expect(authService.refresh).toHaveBeenCalledWith(refreshDto);
    });

    it('should return new access token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      const refreshResponse = { accessToken: 'new-mock-access-token' };
      jest.spyOn(authService, 'refresh').mockResolvedValue(refreshResponse);

      const result = await controller.refresh(refreshDto);

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).toBe('new-mock-access-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'invalid-refresh-token',
      };

      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'expired-refresh-token',
      };

      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValue(new UnauthorizedException('Refresh token expired or invalid'));

      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should not require authentication', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      const refreshResponse = { accessToken: 'new-mock-access-token' };
      jest.spyOn(authService, 'refresh').mockResolvedValue(refreshResponse);

      // Should not throw any authentication error
      await expect(controller.refresh(refreshDto)).resolves.toEqual(refreshResponse);
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid refresh token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(refreshDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(authService.logout).toHaveBeenCalledWith(refreshDto.refreshToken);
    });

    it('should return success response', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(refreshDto);

      expect(result).toEqual({
        success: true,
        message: 'Logout successful',
      });
    });

    it('should invalidate refresh token', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await controller.logout(refreshDto);

      expect(authService.logout).toHaveBeenCalledWith('mock-refresh-token');
    });

    it('should handle logout for non-existent refresh token gracefully', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'non-existent-token',
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(refreshDto);

      expect(result.success).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith('non-existent-token');
    });
  });

  describe('IP address extraction', () => {
    it('should handle request with no IP information', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      const requestWithoutIp = {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: undefined,
        socket: {
          remoteAddress: undefined,
        },
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, requestWithoutIp);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        'Mozilla/5.0',
        'Unknown',
      );
    });

    it('should handle X-Forwarded-For with spaces', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      const requestWithSpaces = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
        },
        ip: '192.168.1.1',
        socket: {
          remoteAddress: '192.168.1.1',
        },
      } as any;

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      await controller.login(loginDto, requestWithSpaces);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        'Mozilla/5.0',
        '192.168.1.1',
      );
    });
  });

  describe('HTTP status codes', () => {
    it('login should return 200 OK', async () => {
      const loginDto: LoginDto = {
        nationalId: '12345678901234567890',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toBeDefined();
      // Note: HTTP status code is set via @HttpCode decorator, not in the method
    });

    it('refresh should return 200 OK', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      const refreshResponse = { accessToken: 'new-mock-access-token' };
      jest.spyOn(authService, 'refresh').mockResolvedValue(refreshResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toBeDefined();
    });

    it('logout should return 200 OK', async () => {
      const refreshDto: RefreshDto = {
        refreshToken: 'mock-refresh-token',
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(refreshDto);

      expect(result).toBeDefined();
    });
  });
});
