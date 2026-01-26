import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { logger } from '../../common/logger/logger';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  async getStatus() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        database: 'connected',
        blockchain: 'ready',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'error',
        database: 'disconnected',
        blockchain: 'unavailable',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
