import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 12345,
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('status')
  @ApiOperation({ summary: 'Detailed status' })
  @ApiResponse({
    status: 200,
    description: 'Detailed system status',
    schema: {
      example: {
        status: 'ok',
        database: 'connected',
        blockchain: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    },
  })
  getStatus() {
    return this.healthService.getStatus();
  }
}
