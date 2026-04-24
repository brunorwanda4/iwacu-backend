import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnsResourceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const citizenId = request.user?.sub;
    const resourceId = request.params?.id;

    if (!citizenId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!resourceId) {
      throw new ForbiddenException('Resource ID not provided');
    }

    // Check if citizen owns the resource (visitor registration)
    const registration = await this.prisma.visitorRegistration.findUnique({
      where: { id: resourceId },
    });

    if (!registration || registration.hostCitizenId !== citizenId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
