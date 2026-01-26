import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { EventsModule } from './modules/events/events.module';
import { ProofModule } from './modules/proof/proof.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TransferModule,
    ValidatorModule,
    GovernanceModule,
    EventsModule,
    ProofModule,
    HealthModule,
  ],
})
export class AppModule {}
