import { Module } from '@nestjs/common';
import { ValidatorService } from './validator.service';
import { ValidatorController } from './validator.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BlockchainModule, AuthModule],
  controllers: [ValidatorController],
  providers: [ValidatorService],
  exports: [ValidatorService],
})
export class ValidatorModule {}
