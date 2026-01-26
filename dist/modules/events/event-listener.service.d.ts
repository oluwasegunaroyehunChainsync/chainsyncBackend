import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class EventListenerService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private blockchainService;
    private listeners;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private isValidAddress;
    private setupEventListeners;
    private listenToTransferEvents;
    private handleTransferInitiated;
    private handleTransferConfirmed;
    private handleTransferReleased;
    private handleTransferFailed;
}
//# sourceMappingURL=event-listener.service.d.ts.map