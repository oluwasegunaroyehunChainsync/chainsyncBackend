import { Module } from '@nestjs/common';
import { ProofVerifierService } from './proof-verifier.service';

@Module({
  providers: [ProofVerifierService],
  exports: [ProofVerifierService],
})
export class ProofModule {}
