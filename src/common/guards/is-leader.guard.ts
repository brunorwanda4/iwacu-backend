import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IsLeaderGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const citizenId = request.user?.sub;

    if (!citizenId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if citizen is a leader
    const leader = await this.prisma.leader.findFirst({
      where: { citizenId },
    });

    if (!leader) {
      throw new ForbiddenException('User is not a leader');
    }

    // Attach leader info to request
    request.leader = leader;
    return true;
  }
}
