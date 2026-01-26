import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { logger } from './common/logger/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ChainSync API')
    .setDescription(
      'Non-custodial cross-chain token transfer platform. Users maintain full custody of their tokens.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'System health and status endpoints')
    .addTag('Auth', 'Authentication and wallet connection')
    .addTag('Transfers', 'Token transfer operations')
    .addTag('Validators', 'Validator management and staking')
    .addTag('Governance', 'Governance and voting')
    .addTag('Chains', 'Supported blockchain networks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.info(`🚀 ChainSync Backend running on port ${port}`);
  logger.info(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});
