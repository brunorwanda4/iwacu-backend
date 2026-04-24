import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Authenticate with National ID
   * Rate limited to 5 attempts per minute per IP
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with National ID',
    description: 'Authenticate a citizen using their National ID (no password required)',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid National ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid National ID or citizen not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts, rate limit exceeded',
  })
  async login(@Body() loginDto: LoginDto, @Req() request: Request): Promise<AuthResponseDto> {
    const deviceInfo = request.headers['user-agent'] || 'Unknown';
    const ipAddress = this.extractIpAddress(request);

    return this.authService.login(loginDto, deviceInfo, ipAddress);
  }

  /**
   * Refresh access token
   * Rate limited to 5 attempts per minute per IP
   */
  @Post('refresh')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts, rate limit exceeded',
  })
  async refresh(@Body() refreshDto: RefreshDto): Promise<{ accessToken: string }> {
    return this.authService.refresh(refreshDto);
  }

  /**
   * Logout and invalidate refresh token
   * Requires valid JWT access token
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout and invalidate refresh token',
    description: 'Logout the current session and invalidate the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing access token',
  })
  async logout(@Body() refreshDto: RefreshDto): Promise<{ success: boolean; message: string }> {
    await this.authService.logout(refreshDto.refreshToken);
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  /**
   * Extract IP address from request headers
   * Checks X-Forwarded-For header first (for proxied requests), then falls back to connection.remoteAddress
   */
  private extractIpAddress(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
      return ips.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'Unknown';
  }
}
