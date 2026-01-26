import { Module } from '@nestjs/common';
import { EventListenerService } from './event-listener.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [EventListenerService],
  exports: [EventListenerService],
})
export class EventsModule {}
