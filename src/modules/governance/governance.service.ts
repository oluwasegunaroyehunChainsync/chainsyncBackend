import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';

const GOVERNANCE_ABI = [
  'function createProposal(string memory title, string memory description, uint256 votingPeriod) external returns (uint256)',
  'function vote(uint256 proposalId, uint8 support) external',
  'function executeProposal(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, string title, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint8 state))',
  'function getProposals() external view returns (tuple(uint256 id, string title, string description, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint8 state)[])',
  'function getVotes(address account) external view returns (uint256)',
];

@Injectable()
export class GovernanceService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Create proposal
   */
  async createProposal(
    userAddress: string,
    chainId: number,
    title: string,
    description: string,
    votingPeriod: number,
    contractAddress: string,
    privateKey?: string,
  ) {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new BadRequestException('Invalid address');
      }

      // Create on blockchain
      let proposalId: number | null = null;
      if (privateKey) {
        const txHash = await this.blockchainService.sendContractTransaction(
          chainId,
          contractAddress,
          GOVERNANCE_ABI,
          'createProposal',
          [title, description, votingPeriod],
          privateKey,
          500000,
        );

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

      logger.info(`Proposal created: ${proposal.id}`);

      return proposal;
    } catch (error) {
      logger.error('Proposal creation failed:', error);
      throw error;
    }
  }

  /**
   * Vote on proposal
   */
  async voteOnProposal(
    userAddress: string,
    chainId: number,
    proposalId: string,
    support: number,
    contractAddress: string,
    privateKey?: string,
  ) {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new BadRequestException('Invalid address');
      }

      // Vote on blockchain
      if (privateKey) {
        await this.blockchainService.sendContractTransaction(
          chainId,
          contractAddress,
          GOVERNANCE_ABI,
          'vote',
          [proposalId, support],
          privateKey,
          500000,
        );
      }

      // Get or create wallet
      const wallet = await this.prisma.wallet.findUnique({
        where: { address: ethers.getAddress(userAddress) },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
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

      logger.info(`Vote recorded for proposal ${proposalId}`);

      return vote;
    } catch (error) {
      logger.error('Vote failed:', error);
      throw error;
    }
  }

  /**
   * Get proposal
   */
  async getProposal(proposalId: string) {
    try {
      const proposal = await this.prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          votes: true,
        },
      });

      if (!proposal) {
        throw new BadRequestException('Proposal not found');
      }

      const forVotes = proposal.votes.filter((v) => v.support === true).length;
      const againstVotes = proposal.votes.filter((v) => v.support === false).length;

      return {
        ...proposal,
        forVotes,
        againstVotes,
        totalVotes: proposal.votes.length,
      };
    } catch (error) {
      logger.error('Failed to get proposal:', error);
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
    } catch (error) {
      logger.error('Failed to get proposals:', error);
      throw error;
    }
  }

  /**
   * Get user votes
   */
  async getUserVotes(userAddress: string) {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new BadRequestException('Invalid address');
      }

      const wallet = await this.prisma.wallet.findUnique({
        where: { address: ethers.getAddress(userAddress) },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      return await this.prisma.vote.findMany({
        where: { walletId: wallet.id },
        include: { proposal: true },
      });
    } catch (error) {
      logger.error('Failed to get user votes:', error);
      throw error;
    }
  }

  /**
   * Get voting power
   */
  async getVotingPower(
    userAddress: string,
    chainId: number,
    contractAddress: string,
  ): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new BadRequestException('Invalid address');
      }

      const votes = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        GOVERNANCE_ABI,
        'getVotes',
        [ethers.getAddress(userAddress)],
      );

      return votes.toString();
    } catch (error) {
      logger.error('Failed to get voting power:', error);
      throw error;
    }
  }
}
