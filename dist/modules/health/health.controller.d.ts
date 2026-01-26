import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
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
//# sourceMappingURL=health.controller.d.ts.map