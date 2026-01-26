"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const logger_1 = require("./common/logger/logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });
    // Swagger documentation
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ChainSync API')
        .setDescription('Non-custodial cross-chain token transfer platform. Users maintain full custody of their tokens.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Health', 'System health and status endpoints')
        .addTag('Auth', 'Authentication and wallet connection')
        .addTag('Transfers', 'Token transfer operations')
        .addTag('Validators', 'Validator management and staking')
        .addTag('Governance', 'Governance and voting')
        .addTag('Chains', 'Supported blockchain networks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger_1.logger.info(`🚀 ChainSync Backend running on port ${port}`);
    logger_1.logger.info(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
    logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap().catch((error) => {
    logger_1.logger.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map