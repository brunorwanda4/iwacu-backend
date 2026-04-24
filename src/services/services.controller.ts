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
import { ServicesService } from './services.service';
import {
  ServiceDepartmentDto,
  ServiceRequestDto,
  CreateServiceRequestDto,
  UpdateServiceRequestStatusDto,
  PaginatedServiceRequestsDto,
} from './dto/service.dto';
import { Request } from 'express';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  /**
   * Get all active service departments
   * Requirements: 13
   */
  @Get('departments')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all service departments',
    description: 'Retrieve all active service departments',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    type: [ServiceDepartmentDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async getDepartments(): Promise<ServiceDepartmentDto[]> {
    return this.servicesService.getDepartments();
  }

  /**
   * Create service request
   * Requirements: 11, 12
   */
  @Post('requests')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create service request',
    description: 'Submit a new service request to a government department',
  })
  @ApiResponse({
    status: 201,
    description: 'Service request created successfully',
    type: ServiceRequestDto,
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
    description: 'Department not found',
  })
  async createRequest(
    @Body() dto: CreateServiceRequestDto,
    @Req() request: Request,
  ): Promise<ServiceRequestDto> {
    const citizenId = (request.user as any)?.sub;
    return this.servicesService.createRequest(citizenId, dto);
  }

  /**
   * Get citizen's service requests
   * Requirements: 12
   */
  @Get('requests/mine')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get my service requests',
    description: 'Retrieve all service requests submitted by the current citizen',
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
    description: 'Service requests retrieved successfully',
    type: PaginatedServiceRequestsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async getMyRequests(
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedServiceRequestsDto> {
    const citizenId = (request.user as any)?.sub;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.servicesService.getMyRequests(citizenId, pageNum, limitNum);
  }

  /**
   * Get service request by reference number
   * Requirements: 12
   */
  @Get('requests/:referenceNumber')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get service request by reference number',
    description: 'Retrieve a specific service request by its reference number',
  })
  @ApiResponse({
    status: 200,
    description: 'Service request retrieved successfully',
    type: ServiceRequestDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Service request not found',
  })
  async getRequestByReference(
    @Param('referenceNumber') referenceNumber: string,
  ): Promise<ServiceRequestDto> {
    return this.servicesService.getRequestByReference(referenceNumber);
  }

  /**
   * Update service request status
   * Requirements: 12
   */
  @Patch('requests/:id/status')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update service request status',
    description: 'Update the status of a service request (department staff only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service request status updated successfully',
    type: ServiceRequestDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status or input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Service request not found',
  })
  async updateRequestStatus(
    @Param('id') requestId: string,
    @Body() dto: UpdateServiceRequestStatusDto,
  ): Promise<ServiceRequestDto> {
    return this.servicesService.updateRequestStatus(requestId, dto);
  }
}
