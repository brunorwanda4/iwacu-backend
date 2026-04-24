import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisitorsService } from './visitors.service';
import {
  VisitorRegistrationDto,
  RegisterVisitorDto,
  CheckOutDto,
  PaginatedVisitorRegistrationsDto,
} from './dto/visitor.dto';
import { Request } from 'express';

@ApiTags('Visitors')
@Controller('visitors')
@UseGuards(JwtAuthGuard)
export class VisitorsController {
  constructor(private visitorsService: VisitorsService) {}

  /**
   * Register a new visitor
   * Requirements: 14
   */
  @Post('register')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Register visitor',
    description: 'Register a new visitor for community safety tracking',
  })
  @ApiResponse({
    status: 201,
    description: 'Visitor registered successfully',
    type: VisitorRegistrationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Host citizen or location not found',
  })
  async registerVisitor(
    @Body() dto: RegisterVisitorDto,
    @Req() request: Request,
  ): Promise<VisitorRegistrationDto> {
    const hostCitizenId = (request.user as any)?.sub;
    return this.visitorsService.registerVisitor(hostCitizenId, dto);
  }

  /**
   * Check out visitor
   * Requirements: 15
   */
  @Patch(':id/checkout')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Check out visitor',
    description: 'Record the checkout time for a visitor',
  })
  @ApiResponse({
    status: 200,
    description: 'Visitor checked out successfully',
    type: VisitorRegistrationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or visitor already checked out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Visitor registration not found',
  })
  async checkOutVisitor(
    @Param('id') registrationId: string,
    @Body() dto: CheckOutDto,
  ): Promise<VisitorRegistrationDto> {
    return this.visitorsService.checkOutVisitor(registrationId, dto);
  }

  /**
   * Get active visitors in a village
   * Requirements: 14, 15
   */
  @Get('active')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get active visitors',
    description: 'Retrieve all active (checked in but not checked out) visitors in a village',
  })
  @ApiQuery({
    name: 'villageId',
    required: true,
    description: 'Village ID to get active visitors for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Active visitors retrieved successfully',
    type: PaginatedVisitorRegistrationsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async getActiveVisitors(
    @Query('villageId') villageId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.visitorsService.getActiveVisitors(villageId, pageNum, limitNum);
  }

  /**
   * Get visitor history for homeowner
   * Requirements: 14, 15
   */
  @Get('history')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get my visitor history',
    description: 'Retrieve all visitor registrations for the current homeowner',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Visitor history retrieved successfully',
    type: PaginatedVisitorRegistrationsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async getVisitorHistory(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    const hostCitizenId = (request.user as any)?.sub;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.visitorsService.getVisitorHistory(hostCitizenId, pageNum, limitNum);
  }

  /**
   * Get visitors by village
   * Requirements: 14, 15
   */
  @Get('by-village')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get visitors by village',
    description: 'Retrieve all visitor registrations for a specific village',
  })
  @ApiQuery({
    name: 'villageId',
    required: true,
    description: 'Village ID to get visitors for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Visitors retrieved successfully',
    type: PaginatedVisitorRegistrationsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async getVisitorsByVillage(
    @Query('villageId') villageId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedVisitorRegistrationsDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.visitorsService.getVisitorsByVillage(villageId, pageNum, limitNum);
  }
}
