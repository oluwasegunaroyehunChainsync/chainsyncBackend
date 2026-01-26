import { Module } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BlockchainModule, AuthModule],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
