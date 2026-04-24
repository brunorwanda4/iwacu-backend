import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  nationalId: string;
  homeLocationId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Fetch the citizen from the database to ensure they still exist and are active
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: payload.sub },
      include: { homeLocation: true },
    });

    if (!citizen || !citizen.isActive) {
      return null;
    }

    // Attach citizen to request.user
    return {
      id: citizen.id,
      nationalId: citizen.nationalId,
      firstName: citizen.firstName,
      lastName: citizen.lastName,
      homeLocationId: citizen.homeLocationId,
      homeLocation: citizen.homeLocation,
      isLeader: citizen.isLeader,
    };
  }
}
