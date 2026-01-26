"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventListenerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const logger_1 = require("../../common/logger/logger");
const ethers_1 = require("ethers");
const CHAINSYNC_ABI = [
    'event TransferInitiated(bytes32 indexed transferId, address indexed user, address token, uint256 amount, uint256 destinationChain)',
    'event TransferConfirmed(bytes32 indexed transferId, string txHash)',
    'event TransferReleased(bytes32 indexed transferId, address recipient)',
    'event TransferFailed(bytes32 indexed transferId, string reason)',
];
let EventListenerService = class EventListenerService {
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
        this.listeners = new Map();
    }
    async onModuleInit() {
        // Disable event listeners on free tier RPCs as they don't support eth_newFilter
        // Event listeners are only needed for production with paid RPC providers
        if (process.env.ENABLE_EVENT_LISTENERS === 'true') {
            logger_1.logger.info('Initializing event listeners...');
            this.setupEventListeners();
        }
        else {
            logger_1.logger.info('Event listeners disabled (set ENABLE_EVENT_LISTENERS=true to enable)');
        }
    }
    async onModuleDestroy() {
        logger_1.logger.info('Cleaning up event listeners...');
        this.listeners.forEach((listener) => {
            if (listener && typeof listener.removeAllListeners === 'function') {
                listener.removeAllListeners();
            }
        });
        this.listeners.clear();
    }
    isValidAddress(address) {
        try {
            if (!address || address === '0x...' || address.length !== 42) {
                return false;
            }
            return ethers_1.ethers.isAddress(address);
        }
        catch (error) {
            return false;
        }
    }
    setupEventListeners() {
        const chains = [1, 137, 42161, 10, 11155111, 80002, 31337];
        const contractAddress = process.env.CHAINSYNC_CONTRACT_ADDRESS;
        // Validate contract address
        if (!contractAddress || !this.isValidAddress(contractAddress)) {
            logger_1.logger.warn('⚠️ CHAINSYNC_CONTRACT_ADDRESS not set or invalid, skipping event listeners');
            logger_1.logger.warn('Set a valid contract address in .env to enable event listeners');
            return;
        }
        chains.forEach((chainId) => {
            try {
                this.listenToTransferEvents(chainId, contractAddress);
            }
            catch (error) {
                logger_1.logger.error(`Failed to setup listeners for chain ${chainId}:`, error);
            }
        });
    }
    listenToTransferEvents(chainId, contractAddress) {
        try {
            const provider = this.blockchainService.getProvider(chainId);
            // Listen for TransferInitiated events
            provider.on({
                address: contractAddress,
                topics: [
                    '0x' +
                        Buffer.from('TransferInitiated(bytes32,address,address,uint256,uint256)')
                            .toString('hex'),
                ],
            }, (log) => {
                this.handleTransferInitiated(log, chainId);
            });
            // Listen for TransferConfirmed events
            provider.on({
                address: contractAddress,
                topics: [
                    '0x' +
                        Buffer.from('TransferConfirmed(bytes32,string)')
                            .toString('hex'),
                ],
            }, (log) => {
                this.handleTransferConfirmed(log, chainId);
            });
            // Listen for TransferReleased events
            provider.on({
                address: contractAddress,
                topics: [
                    '0x' +
                        Buffer.from('TransferReleased(bytes32,address)')
                            .toString('hex'),
                ],
            }, (log) => {
                this.handleTransferReleased(log, chainId);
            });
            // Listen for TransferFailed events
            provider.on({
                address: contractAddress,
                topics: [
                    '0x' +
                        Buffer.from('TransferFailed(bytes32,string)')
                            .toString('hex'),
                ],
            }, (log) => {
                this.handleTransferFailed(log, chainId);
            });
            logger_1.logger.info(`Event listeners setup for chain ${chainId}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to setup event listeners for chain ${chainId}:`, error);
        }
    }
    async handleTransferInitiated(log, chainId) {
        try {
            logger_1.logger.info(`TransferInitiated event on chain ${chainId}:`, log);
            // Parse event data and update database
            // This would typically decode the log data and update the transfer status
        }
        catch (error) {
            logger_1.logger.error('Error handling TransferInitiated event:', error);
        }
    }
    async handleTransferConfirmed(log, chainId) {
        try {
            logger_1.logger.info(`TransferConfirmed event on chain ${chainId}:`, log);
            // Update transfer status to CONFIRMED
        }
        catch (error) {
            logger_1.logger.error('Error handling TransferConfirmed event:', error);
        }
    }
    async handleTransferReleased(log, chainId) {
        try {
            logger_1.logger.info(`TransferReleased event on chain ${chainId}:`, log);
            // Update transfer status to RELEASED
        }
        catch (error) {
            logger_1.logger.error('Error handling TransferReleased event:', error);
        }
    }
    async handleTransferFailed(log, chainId) {
        try {
            logger_1.logger.info(`TransferFailed event on chain ${chainId}:`, log);
            // Update transfer status to FAILED
        }
        catch (error) {
            logger_1.logger.error('Error handling TransferFailed event:', error);
        }
    }
};
exports.EventListenerService = EventListenerService;
exports.EventListenerService = EventListenerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], EventListenerService);
//# sourceMappingURL=event-listener.service.js.map