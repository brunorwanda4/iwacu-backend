import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CitizensService } from './citizens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CitizenWithLocationDto } from './dto/citizen.dto';

@ApiTags('Citizens')
@Controller('citizens')
export class CitizensController {
  constructor(private citizensService: CitizensService) {}

  /**
   * Get current citizen's profile with full location hierarchy
   * Returns citizen information including the complete location chain:
   * village → cell → sector → district → province
   * Requires valid JWT access token
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current citizen profile',
    description:
      'Retrieve the authenticated citizen profile with full location hierarchy (village → cell → sector → district → province)',
  })
  @ApiResponse({
    status: 200,
    description: 'Citizen profile retrieved successfully',
    type: CitizenWithLocationDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Citizen not found',
  })
  async getMe(@Req() request: Request): Promise<CitizenWithLocationDto> {
    const citizenId = (request.user as any).sub;
    return this.citizensService.getMe(citizenId);
  }
}
