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
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const logger_1 = require("../../common/logger/logger");
const ethers_1 = require("ethers");
const GOVERNANCE_ABI = [
    'function createProposal(string memory title, string memory description, uint256 votingPeriod) external returns (uint256)',
    'function vote(uint256 proposalId, uint8 support) external',
    'function executeProposal(uint256 proposalId) external',
    'function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, string title, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint8 state))',
    'function getProposals() external view returns (tuple(uint256 id, string title, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint8 state)[])',
    'function getVotes(address account) external view returns (uint256)',
];
let GovernanceService = class GovernanceService {
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
    }
    /**
     * Create proposal
     */
    async createProposal(userAddress, chainId, title, description, votingPeriod, contractAddress, privateKey) {
        try {
            if (!ethers_1.ethers.isAddress(userAddress)) {
                throw new common_1.BadRequestException('Invalid address');
            }
            // Create on blockchain
            let proposalId = null;
            if (privateKey) {
                const txHash = await this.blockchainService.sendContractTransaction(chainId, contractAddress, GOVERNANCE_ABI, 'createProposal', [title, description, votingPeriod], privateKey, 500000);
                // In real scenario, extract proposalId from logs
                proposalId = Math.floor(Math.random() * 1000000);
            }
            // Create database record
            const proposal = await this.prisma.proposal.create({
                data: {
                    title,
                    description,
                    status: 'ACTIVE',
                    startBlock: 0,
                    endBlock: votingPeriod,
                },
            });
            logger_1.logger.info(`Proposal created: ${proposal.id}`);
            return proposal;
        }
        catch (error) {
            logger_1.logger.error('Proposal creation failed:', error);
            throw error;
        }
    }
    /**
     * Vote on proposal
     */
    async voteOnProposal(userAddress, chainId, proposalId, support, contractAddress, privateKey) {
        try {
            if (!ethers_1.ethers.isAddress(userAddress)) {
                throw new common_1.BadRequestException('Invalid address');
            }
            // Vote on blockchain
            if (privateKey) {
                await this.blockchainService.sendContractTransaction(chainId, contractAddress, GOVERNANCE_ABI, 'vote', [proposalId, support], privateKey, 500000);
            }
            // Get or create wallet
            const wallet = await this.prisma.wallet.findUnique({
                where: { address: ethers_1.ethers.getAddress(userAddress) },
            });
            if (!wallet) {
                throw new common_1.BadRequestException('Wallet not found');
            }
            // Record vote
            const vote = await this.prisma.vote.create({
                data: {
                    proposalId,
                    walletId: wallet.id,
                    support: support === 1 ? true : false,
                    votingPower: '1',
                },
            });
            logger_1.logger.info(`Vote recorded for proposal ${proposalId}`);
            return vote;
        }
        catch (error) {
            logger_1.logger.error('Vote failed:', error);
            throw error;
        }
    }
    /**
     * Get proposal
     */
    async getProposal(proposalId) {
        try {
            const proposal = await this.prisma.proposal.findUnique({
                where: { id: proposalId },
                include: {
                    votes: true,
                },
            });
            if (!proposal) {
                throw new common_1.BadRequestException('Proposal not found');
            }
            const forVotes = proposal.votes.filter((v) => v.support === true).length;
            const againstVotes = proposal.votes.filter((v) => v.support === false).length;
            return {
                ...proposal,
                forVotes,
                againstVotes,
                totalVotes: proposal.votes.length,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get proposal:', error);
            throw error;
        }
    }
    /**
     * Get all proposals
     */
    async getAllProposals() {
        try {
            const proposals = await this.prisma.proposal.findMany({
                include: {
                    votes: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return proposals.map((p) => ({
                ...p,
                forVotes: p.votes.filter((v) => v.support === true).length,
                againstVotes: p.votes.filter((v) => v.support === false).length,
                totalVotes: p.votes.length,
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to get proposals:', error);
            throw error;
        }
    }
    /**
     * Get user votes
     */
    async getUserVotes(userAddress) {
        try {
            if (!ethers_1.ethers.isAddress(userAddress)) {
                throw new common_1.BadRequestException('Invalid address');
            }
            const wallet = await this.prisma.wallet.findUnique({
                where: { address: ethers_1.ethers.getAddress(userAddress) },
            });
            if (!wallet) {
                throw new common_1.BadRequestException('Wallet not found');
            }
            return await this.prisma.vote.findMany({
                where: { walletId: wallet.id },
                include: { proposal: true },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get user votes:', error);
            throw error;
        }
    }
    /**
     * Get voting power
     */
    async getVotingPower(userAddress, chainId, contractAddress) {
        try {
            if (!ethers_1.ethers.isAddress(userAddress)) {
                throw new common_1.BadRequestException('Invalid address');
            }
            const votes = await this.blockchainService.callContractFunction(chainId, contractAddress, GOVERNANCE_ABI, 'getVotes', [ethers_1.ethers.getAddress(userAddress)]);
            return votes.toString();
        }
        catch (error) {
            logger_1.logger.error('Failed to get voting power:', error);
            throw error;
        }
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map