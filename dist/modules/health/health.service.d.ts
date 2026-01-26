import { PrismaService } from '../../prisma/prisma.service';
export declare class HealthService {
    private prisma;
    private startTime;
    constructor(prisma: PrismaService);
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    getStatus(): Promise<{
        status: string;
        database: string;
        blockchain: string;
        timestamp: string;
        environment: string;
        version: string;
        error?: undefined;
    } | {
        status: string;
        database: string;
        blockchain: string;
        timestamp: string;
        error: string;
        environment?: undefined;
        version?: undefined;
    }>;
}
//# sourceMappingURL=health.service.d.ts.map