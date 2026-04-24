import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CitizensService } from '../citizens/citizens.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private citizensService: CitizensService,
  ) {}

  async login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<AuthResponseDto> {
    // Verify National ID format and existence
    const citizen = await this.prisma.citizen.findUnique({
      where: { nationalId: loginDto.nationalId },
      include: { homeLocation: true },
    });

    if (!citizen) {
      throw new UnauthorizedException('Invalid National ID or citizen not found');
    }

    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(
      {
        sub: citizen.id,
        nationalId: citizen.nationalId,
        homeLocationId: citizen.homeLocationId,
      },
    );

    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(
      {
        sub: citizen.id,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    // Store refresh token in sessions table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        citizenId: citizen.id,
        refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    });

    const citizenDto = this.citizensService.toCitizenDto(citizen);

    return {
      accessToken,
      refreshToken,
      citizen: citizenDto,
    };
  }

  async refresh(refreshDto: RefreshDto): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token signature
      this.jwtService.verify(refreshDto.refreshToken);

      // Check if token exists in database and is not expired
      const session = await this.prisma.session.findUnique({
        where: { refreshToken: refreshDto.refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired or invalid');
      }

      // Get citizen
      const citizen = await this.prisma.citizen.findUnique({
        where: { id: session.citizenId },
      });

      if (!citizen) {
        throw new UnauthorizedException('Citizen not found');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          sub: citizen.id,
          nationalId: citizen.nationalId,
          homeLocationId: citizen.homeLocationId,
        },
      );

      // Update lastUsedAt timestamp
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
