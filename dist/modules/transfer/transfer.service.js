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
exports.TransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const logger_1 = require("../../common/logger/logger");
const ethers_1 = require("ethers");
const client_1 = require("@prisma/client");
const CHAINSYNC_ABI = [
    'function transferSameChain(address token, address recipient, uint256 amount) external returns (bytes32)',
    'function initiateTransfer(address token, uint256 amount, uint256 destinationChain, address recipient) external returns (bytes32)',
    'function releaseTokens(bytes32 transferId, string memory txHash) external',
    'function getTransfer(bytes32 transferId) external view returns (tuple(bytes32 id, address user, address token, uint256 amount, uint256 fee, uint256 sourceChain, uint256 destinationChain, address recipient, uint8 status, uint256 timestamp, string txHash))',
    'function calculateFee(uint256 amount) external view returns (uint256)',
];
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
];
let TransferService = class TransferService {
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    /**
     * Initiate same-chain transfer
     * Note: Blockchain transaction is executed on frontend via MetaMask
     */
    async initiateSameChainTransfer(userAddress, chainId, tokenAddress, recipientAddress, amount, contractAddress) {
        try {
            // Validate inputs
            if (!ethers_1.ethers.isAddress(tokenAddress)) {
                throw new common_1.BadRequestException('Invalid token address');
            }
            if (!ethers_1.ethers.isAddress(recipientAddress)) {
                throw new common_1.BadRequestException('Invalid recipient address');
            }
            const amountBigInt = ethers_1.ethers.parseEther(amount);
            // Check balance
            const balance = await this.blockchainService.callContractFunction(chainId, tokenAddress, ERC20_ABI, 'balanceOf', [userAddress]);
            if (balance < amountBigInt) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            // Calculate fee
            const fee = await this.blockchainService.callContractFunction(chainId, contractAddress, CHAINSYNC_ABI, 'calculateFee', [amountBigInt]);
            // Get wallet record to use its ID as userId
            // Normalize address to match how it's stored in database (checksummed)
            const normalizedAddress = ethers_1.ethers.getAddress(userAddress);
            const wallet = await this.prisma.wallet.findUnique({
                where: { address: normalizedAddress },
            });
            if (!wallet) {
                throw new Error(`Wallet not found for address: ${userAddress}`);
            }
            // Create transfer record
            const transferHash = ethers_1.ethers.keccak256(ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'address', 'uint256', 'uint256'], [userAddress, recipientAddress, amountBigInt, Date.now()]));
            const transfer = await this.prisma.transfer.create({
                data: {
                    transferHash,
                    userId: wallet.id,
                    token: tokenAddress,
                    amount: amountBigInt.toString(),
                    fee: fee.toString(),
                    sourceChain: chainId,
                    destinationChain: chainId,
                    recipient: recipientAddress,
                    status: client_1.TransferStatus.INITIATED,
                },
            });
            logger_1.logger.info(`Same-chain transfer initiated: ${transferHash} from ${userAddress}`);
            // Frontend will execute the blockchain transaction via MetaMask
            // and then call updateTransferStatus endpoint with the txHash
            return transfer;
        }
        catch (error) {
            logger_1.logger.error('Same-chain transfer initiation failed:', error);
            throw error;
        }
    }
    /**
     * Initiate cross-chain transfer
     * Note: Blockchain transaction is executed on frontend via MetaMask
     */
    async initiateCrossChainTransfer(userAddress, sourceChainId, destinationChainId, tokenAddress, recipientAddress, amount, contractAddress) {
        try {
            // Validate inputs
            if (!ethers_1.ethers.isAddress(tokenAddress)) {
                throw new common_1.BadRequestException('Invalid token address');
            }
            if (!ethers_1.ethers.isAddress(recipientAddress)) {
                throw new common_1.BadRequestException('Invalid recipient address');
            }
            if (sourceChainId === destinationChainId) {
                throw new common_1.BadRequestException('Use same-chain transfer for same chain');
            }
            const amountBigInt = ethers_1.ethers.parseEther(amount);
            // Check balance
            const balance = await this.blockchainService.callContractFunction(sourceChainId, tokenAddress, ERC20_ABI, 'balanceOf', [userAddress]);
            if (balance < amountBigInt) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            // Calculate fee
            const fee = await this.blockchainService.callContractFunction(sourceChainId, contractAddress, CHAINSYNC_ABI, 'calculateFee', [amountBigInt]);
            // Get wallet record to use its ID as userId
            // Normalize address to match how it's stored in database (checksummed)
            const normalizedAddress = ethers_1.ethers.getAddress(userAddress);
            const wallet = await this.prisma.wallet.findUnique({
                where: { address: normalizedAddress },
            });
            if (!wallet) {
                throw new Error(`Wallet not found for address: ${userAddress}`);
            }
            // Create transfer record
            const transferHash = ethers_1.ethers.keccak256(ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'address', 'uint256', 'uint256', 'uint256'], [
                userAddress,
                recipientAddress,
                amountBigInt,
                destinationChainId,
                Date.now(),
            ]));
            const transfer = await this.prisma.transfer.create({
                data: {
                    transferHash,
                    userId: wallet.id,
                    token: tokenAddress,
                    amount: amountBigInt.toString(),
                    fee: fee.toString(),
                    sourceChain: sourceChainId,
                    destinationChain: destinationChainId,
                    recipient: recipientAddress,
                    status: client_1.TransferStatus.LOCKED,
                },
            });
            logger_1.logger.info(`Cross-chain transfer initiated: ${transferHash} from chain ${sourceChainId} to ${destinationChainId}`);
            // Frontend will execute the blockchain transaction via MetaMask
            // and then call updateTransferStatus endpoint with the txHash
            return transfer;
        }
        catch (error) {
            logger_1.logger.error('Cross-chain transfer initiation failed:', error);
            throw error;
        }
    }
    /**
     * Get transfer status
     */
    async getTransferStatus(transferId) {
        try {
            const transfer = await this.prisma.transfer.findUnique({
                where: { id: transferId },
            });
            if (!transfer) {
                throw new common_1.BadRequestException('Transfer not found');
            }
            return transfer;
        }
        catch (error) {
            logger_1.logger.error('Failed to get transfer status:', error);
            throw error;
        }
    }
    /**
     * Get user transfers
     */
    async getUserTransfers(userAddress) {
        try {
            return await this.prisma.transfer.findMany({
                where: { userId: userAddress },
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get user transfers:', error);
            throw error;
        }
    }
    /**
     * Calculate transfer quote
     */
    async calculateQuote(amount, sourceChainId, destinationChainId, contractAddress) {
        try {
            const amountBigInt = ethers_1.ethers.parseEther(amount);
            const fee = await this.blockchainService.callContractFunction(sourceChainId, contractAddress, CHAINSYNC_ABI, 'calculateFee', [amountBigInt]);
            const netAmount = amountBigInt - fee;
            return {
                amount: amountBigInt.toString(),
                fee: fee.toString(),
                netAmount: netAmount.toString(),
                sourceChain: sourceChainId,
                destinationChain: destinationChainId,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate quote:', error);
            throw error;
        }
    }
    /**
     * Update transfer status
     */
    async updateTransferStatus(transferId, status, txHash) {
        try {
            return await this.prisma.transfer.update({
                where: { id: transferId },
                data: {
                    status,
                    txHash,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update transfer status:', error);
            throw error;
        }
    }
};
exports.TransferService = TransferService;
exports.TransferService = TransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], TransferService);
//# sourceMappingURL=transfer.service.js.map