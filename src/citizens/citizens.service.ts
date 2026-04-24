import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CitizenDto, CitizenWithLocationDto } from './dto/citizen.dto';
import type { Citizen } from '@prisma/client';

@Injectable()
export class CitizensService {
  constructor(private prisma: PrismaService) {}

  async getMe(citizenId: string): Promise<CitizenWithLocationDto> {
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
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

    if (!citizen) {
      throw new NotFoundException('Citizen not found');
    }

    return this.toCitizenWithLocationDto(citizen);
  }

  async getCitizenByNationalId(nationalId: string) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { nationalId },
      include: { homeLocation: true },
    });

    if (!citizen) {
      throw new NotFoundException('Citizen not found');
    }

    return citizen;
  }

  async getCitizenById(citizenId: string) {
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
      include: { homeLocation: true },
    });

    if (!citizen) {
      throw new NotFoundException('Citizen not found');
    }

    return citizen;
  }

  toCitizenDto(citizen: Citizen): CitizenDto {
    return {
      id: citizen.id,
      nationalId: citizen.nationalId,
      firstName: citizen.firstName,
      lastName: citizen.lastName,
      phoneNumber: citizen.phoneNumber || undefined,
      isLeader: citizen.isLeader,
    };
  }

  private toCitizenWithLocationDto(citizen: any): CitizenWithLocationDto {
    return {
      id: citizen.id,
      nationalId: citizen.nationalId,
      firstName: citizen.firstName,
      lastName: citizen.lastName,
      phoneNumber: citizen.phoneNumber || undefined,
      isLeader: citizen.isLeader,
      homeLocation: this.buildLocationHierarchy(citizen.homeLocation),
    };
  }

  private buildLocationHierarchy(location: any): any {
    if (!location) {
      return null;
    }

    return {
      id: location.id,
      name: location.name,
      level: location.level,
      parent: location.parent ? this.buildLocationHierarchy(location.parent) : null,
    };
  }
}
