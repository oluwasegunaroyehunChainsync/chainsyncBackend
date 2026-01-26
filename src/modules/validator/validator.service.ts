import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';

const VALIDATOR_REGISTRY_ABI = [
  'function registerValidator() external payable',
  'function addStake() external payable',
  'function removeStake(uint256 amount) external',
  'function unregisterValidator() external',
  'function getValidator(address validator) external view returns (tuple(address validatorAddress, uint256 stake, uint256 joinedAt, bool active, uint256 slashAmount))',
  'function getValidators() external view returns (address[])',
  'function getActiveValidatorsCount() external view returns (uint256)',
  'function isActiveValidator(address validator) external view returns (bool)',
  'function getValidatorStake(address validator) external view returns (uint256)',
  'function minStake() external view returns (uint256)',
];

@Injectable()
export class ValidatorService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Register as validator
   */
  async registerValidator(
    address: string,
    chainId: number,
    stakeAmount: string,
    contractAddress: string,
    privateKey?: string,
  ) {
    try {
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid address');
      }

      const stakeBigInt = ethers.parseEther(stakeAmount);

      // Get minimum stake
      const minStake = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'minStake',
      );

      if (stakeBigInt < minStake) {
        throw new BadRequestException(
          `Stake must be at least ${ethers.formatEther(minStake)} ETH`,
        );
      }

      // Register on blockchain
      if (privateKey) {
        await this.blockchainService.sendContractTransaction(
          chainId,
          contractAddress,
          VALIDATOR_REGISTRY_ABI,
          'registerValidator',
          [],
          privateKey,
          500000,
        );
      }

      // Create validator record
      const validator = await this.prisma.validator.create({
        data: {
          address: ethers.getAddress(address),
          stake: stakeBigInt.toString(),
          active: true,
        },
      });

      logger.info(`Validator registered: ${address}`);

      return validator;
    } catch (error) {
      logger.error('Validator registration failed:', error);
      throw error;
    }
  }

  /**
   * Add stake
   */
  async addStake(
    address: string,
    chainId: number,
    amount: string,
    contractAddress: string,
    privateKey?: string,
  ) {
    try {
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid address');
      }

      const amountBigInt = ethers.parseEther(amount);

      // Add stake on blockchain
      if (privateKey) {
        await this.blockchainService.sendContractTransaction(
          chainId,
          contractAddress,
          VALIDATOR_REGISTRY_ABI,
          'addStake',
          [],
          privateKey,
          500000,
        );
      }

      // Update validator record
      const validator = await this.prisma.validator.update({
        where: { address: ethers.getAddress(address) },
        data: {
          stake: (
            BigInt(
              (
                await this.prisma.validator.findUnique({
                  where: { address: ethers.getAddress(address) },
                })
              )?.stake || '0',
            ) + amountBigInt
          ).toString(),
        },
      });

      logger.info(`Stake added for validator: ${address}`);

      return validator;
    } catch (error) {
      logger.error('Add stake failed:', error);
      throw error;
    }
  }

  /**
   * Get validator info
   */
  async getValidatorInfo(address: string, chainId: number, contractAddress: string) {
    try {
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid address');
      }

      const normalizedAddress = ethers.getAddress(address);

      // Get from blockchain
      const validatorData = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'getValidator',
        [normalizedAddress],
      );

      // Get from database
      const dbValidator = await this.prisma.validator.findUnique({
        where: { address: normalizedAddress },
      });

      return {
        address: normalizedAddress,
        stake: validatorData.stake.toString(),
        joinedAt: new Date(Number(validatorData.joinedAt) * 1000),
        active: validatorData.active,
        slashAmount: validatorData.slashAmount.toString(),
        totalRewards: dbValidator?.totalRewards || '0',
      };
    } catch (error) {
      logger.error('Failed to get validator info:', error);
      throw error;
    }
  }

  /**
   * Get all validators
   */
  async getAllValidators(chainId: number, contractAddress: string) {
    try {
      const validators = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'getValidators',
      );

      return validators;
    } catch (error) {
      logger.error('Failed to get validators:', error);
      throw error;
    }
  }

  /**
   * Get active validators count
   */
  async getActiveValidatorsCount(
    chainId: number,
    contractAddress: string,
  ): Promise<number> {
    try {
      const count = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'getActiveValidatorsCount',
      );

      return Number(count);
    } catch (error) {
      logger.error('Failed to get active validators count:', error);
      throw error;
    }
  }

  /**
   * Check if address is active validator
   */
  async isActiveValidator(
    address: string,
    chainId: number,
    contractAddress: string,
  ): Promise<boolean> {
    try {
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid address');
      }

      const isActive = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'isActiveValidator',
        [ethers.getAddress(address)],
      );

      return isActive;
    } catch (error) {
      logger.error('Failed to check if validator is active:', error);
      throw error;
    }
  }

  /**
   * Get validator stake
   */
  async getValidatorStake(
    address: string,
    chainId: number,
    contractAddress: string,
  ): Promise<string> {
    try {
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Invalid address');
      }

      const stake = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        VALIDATOR_REGISTRY_ABI,
        'getValidatorStake',
        [ethers.getAddress(address)],
      );

      return stake.toString();
    } catch (error) {
      logger.error('Failed to get validator stake:', error);
      throw error;
    }
  }
}
