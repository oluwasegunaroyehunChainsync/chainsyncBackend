import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';

const CHAINSYNC_ABI = [
  'event TransferInitiated(bytes32 indexed transferId, address indexed user, address token, uint256 amount, uint256 destinationChain)',
  'event TransferConfirmed(bytes32 indexed transferId, string txHash)',
  'event TransferReleased(bytes32 indexed transferId, address recipient)',
  'event TransferFailed(bytes32 indexed transferId, string reason)',
];

@Injectable()
export class EventListenerService implements OnModuleInit, OnModuleDestroy {
  private listeners: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async onModuleInit() {
    // Disable event listeners on free tier RPCs as they don't support eth_newFilter
    // Event listeners are only needed for production with paid RPC providers
    if (process.env.ENABLE_EVENT_LISTENERS === 'true') {
      logger.info('Initializing event listeners...');
      this.setupEventListeners();
    } else {
      logger.info('Event listeners disabled (set ENABLE_EVENT_LISTENERS=true to enable)');
    }
  }

  async onModuleDestroy() {
    logger.info('Cleaning up event listeners...');
    this.listeners.forEach((listener) => {
      if (listener && typeof listener.removeAllListeners === 'function') {
        listener.removeAllListeners();
      }
    });
    this.listeners.clear();
  }

  private isValidAddress(address: string): boolean {
    try {
      if (!address || address === '0x...' || address.length !== 42) {
        return false;
      }
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  private setupEventListeners() {
    const chains = [1, 137, 42161, 10, 11155111, 80002, 31337];
    const contractAddress = process.env.CHAINSYNC_CONTRACT_ADDRESS;

    // Validate contract address
    if (!contractAddress || !this.isValidAddress(contractAddress)) {
      logger.warn('⚠️ CHAINSYNC_CONTRACT_ADDRESS not set or invalid, skipping event listeners');
      logger.warn('Set a valid contract address in .env to enable event listeners');
      return;
    }

    chains.forEach((chainId) => {
      try {
        this.listenToTransferEvents(chainId, contractAddress);
      } catch (error) {
        logger.error(`Failed to setup listeners for chain ${chainId}:`, error);
      }
    });
  }

  private listenToTransferEvents(chainId: number, contractAddress: string) {
    try {
      const provider = this.blockchainService.getProvider(chainId);

      // Listen for TransferInitiated events
      provider.on(
        {
          address: contractAddress,
          topics: [
            '0x' +
              Buffer.from('TransferInitiated(bytes32,address,address,uint256,uint256)')
                .toString('hex'),
          ],
        },
        (log) => {
          this.handleTransferInitiated(log, chainId);
        },
      );

      // Listen for TransferConfirmed events
      provider.on(
        {
          address: contractAddress,
          topics: [
            '0x' +
              Buffer.from('TransferConfirmed(bytes32,string)')
                .toString('hex'),
          ],
        },
        (log) => {
          this.handleTransferConfirmed(log, chainId);
        },
      );

      // Listen for TransferReleased events
      provider.on(
        {
          address: contractAddress,
          topics: [
            '0x' +
              Buffer.from('TransferReleased(bytes32,address)')
                .toString('hex'),
          ],
        },
        (log) => {
          this.handleTransferReleased(log, chainId);
        },
      );

      // Listen for TransferFailed events
      provider.on(
        {
          address: contractAddress,
          topics: [
            '0x' +
              Buffer.from('TransferFailed(bytes32,string)')
                .toString('hex'),
          ],
        },
        (log) => {
          this.handleTransferFailed(log, chainId);
        },
      );

      logger.info(`Event listeners setup for chain ${chainId}`);
    } catch (error) {
      logger.error(`Failed to setup event listeners for chain ${chainId}:`, error);
    }
  }

  private async handleTransferInitiated(log: any, chainId: number) {
    try {
      logger.info(`TransferInitiated event on chain ${chainId}:`, log);

      // Parse event data and update database
      // This would typically decode the log data and update the transfer status
    } catch (error) {
      logger.error('Error handling TransferInitiated event:', error);
    }
  }

  private async handleTransferConfirmed(log: any, chainId: number) {
    try {
      logger.info(`TransferConfirmed event on chain ${chainId}:`, log);

      // Update transfer status to CONFIRMED
    } catch (error) {
      logger.error('Error handling TransferConfirmed event:', error);
    }
  }

  private async handleTransferReleased(log: any, chainId: number) {
    try {
      logger.info(`TransferReleased event on chain ${chainId}:`, log);

      // Update transfer status to RELEASED
    } catch (error) {
      logger.error('Error handling TransferReleased event:', error);
    }
  }

  private async handleTransferFailed(log: any, chainId: number) {
    try {
      logger.info(`TransferFailed event on chain ${chainId}:`, log);

      // Update transfer status to FAILED
    } catch (error) {
      logger.error('Error handling TransferFailed event:', error);
    }
  }
}
