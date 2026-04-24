import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeadersService } from './leaders.service';
import { LeaderDto } from './dto/leader.dto';

@ApiTags('Leaders')
@Controller('leaders')
@UseGuards(JwtAuthGuard)
export class LeadersController {
  constructor(private leadersService: LeadersService) {}

  /**
   * Get leaders for a location (village to province)
   * Returns all leaders from the specified location up to the province level
   */
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get leaders for location',
    description:
      'Retrieve all leaders from the specified location up to the province level, ordered from village to province',
  })
  @ApiQuery({
    name: 'locationId',
    required: true,
    description: 'Location ID to get leaders for',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaders retrieved successfully',
    type: [LeaderDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found',
  })
  async getLeadersForLocation(@Query('locationId') locationId: string): Promise<LeaderDto[]> {
    return this.leadersService.getLeadersForLocation(locationId);
  }
}
