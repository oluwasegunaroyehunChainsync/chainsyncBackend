"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const logger_1 = require("../../common/logger/logger");
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.startTime = Date.now();
    }
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
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ok',
                database: 'connected',
                blockchain: 'ready',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                version: '1.0.0',
            };
        }
        catch (error) {
            logger_1.logger.error('Health check failed:', error);
            return {
                status: 'error',
                database: 'disconnected',
                blockchain: 'unavailable',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthService);
//# sourceMappingURL=health.service.js.map