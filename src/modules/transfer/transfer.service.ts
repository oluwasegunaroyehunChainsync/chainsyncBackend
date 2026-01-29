import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';
import { Transfer, TransferStatus } from '@prisma/client';

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
  'function decimals() external view returns (uint8)',
];

// Known token decimals (Ethereum mainnet addresses, lowercase for comparison)
// Most ERC20 tokens use 18 decimals, but stablecoins often use 6
const KNOWN_TOKEN_DECIMALS: Record<string, number> = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 6,  // USDT
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,  // USDC
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 8,  // WBTC
};

@Injectable()
export class TransferService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  /**
   * Initiate same-chain transfer
   * Note: Blockchain transaction is executed on frontend via MetaMask
   */
  async initiateSameChainTransfer(
    userAddress: string,
    chainId: number,
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    contractAddress: string,
  ): Promise<Transfer> {
    try {
      // Validate inputs
      if (!ethers.isAddress(tokenAddress)) {
        throw new BadRequestException('Invalid token address');
      }
      if (!ethers.isAddress(recipientAddress)) {
        throw new BadRequestException('Invalid recipient address');
      }

      // Get token decimals (use known decimals or default to 18)
      const tokenAddressLower = tokenAddress.toLowerCase();
      const decimals = KNOWN_TOKEN_DECIMALS[tokenAddressLower] ?? 18;

      // Use parseUnits with correct decimals (USDT/USDC = 6, WBTC = 8, others = 18)
      const amountBigInt = ethers.parseUnits(amount, decimals);

      // Check balance
      const balance = await this.blockchainService.callContractFunction(
        chainId,
        tokenAddress,
        ERC20_ABI,
        'balanceOf',
        [userAddress],
      );

      if (balance < amountBigInt) {
        throw new BadRequestException('Insufficient balance');
      }

      // Calculate fee
      const fee = await this.blockchainService.callContractFunction(
        chainId,
        contractAddress,
        CHAINSYNC_ABI,
        'calculateFee',
        [amountBigInt],
      );

      // Get wallet record to use its ID as userId
      // Normalize address to match how it's stored in database (checksummed)
      const normalizedAddress = ethers.getAddress(userAddress);
      const wallet = await this.prisma.wallet.findUnique({
        where: { address: normalizedAddress },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for address: ${userAddress}`);
      }

      // Create transfer record
      const transferHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'address', 'uint256', 'uint256'],
          [userAddress, recipientAddress, amountBigInt, Date.now()],
        ),
      );

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
          status: TransferStatus.INITIATED,
        },
      });

      logger.info(
        `Same-chain transfer initiated: ${transferHash} from ${userAddress}`,
      );

      // Frontend will execute the blockchain transaction via MetaMask
      // and then call updateTransferStatus endpoint with the txHash
      return transfer;
    } catch (error) {
      logger.error('Same-chain transfer initiation failed:', error);
      throw error;
    }
  }

  /**
   * Initiate cross-chain transfer
   * Note: Blockchain transaction is executed on frontend via MetaMask
   */
  async initiateCrossChainTransfer(
    userAddress: string,
    sourceChainId: number,
    destinationChainId: number,
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    contractAddress: string,
  ): Promise<Transfer> {
    try {
      // Validate inputs
      if (!ethers.isAddress(tokenAddress)) {
        throw new BadRequestException('Invalid token address');
      }
      if (!ethers.isAddress(recipientAddress)) {
        throw new BadRequestException('Invalid recipient address');
      }
      if (sourceChainId === destinationChainId) {
        throw new BadRequestException('Use same-chain transfer for same chain');
      }

      // Get token decimals (use known decimals or default to 18)
      const tokenAddressLower = tokenAddress.toLowerCase();
      const decimals = KNOWN_TOKEN_DECIMALS[tokenAddressLower] ?? 18;

      // Use parseUnits with correct decimals (USDT/USDC = 6, WBTC = 8, others = 18)
      const amountBigInt = ethers.parseUnits(amount, decimals);

      // Check balance
      const balance = await this.blockchainService.callContractFunction(
        sourceChainId,
        tokenAddress,
        ERC20_ABI,
        'balanceOf',
        [userAddress],
      );

      if (balance < amountBigInt) {
        throw new BadRequestException('Insufficient balance');
      }

      // Calculate fee
      const fee = await this.blockchainService.callContractFunction(
        sourceChainId,
        contractAddress,
        CHAINSYNC_ABI,
        'calculateFee',
        [amountBigInt],
      );

      // Get wallet record to use its ID as userId
      // Normalize address to match how it's stored in database (checksummed)
      const normalizedAddress = ethers.getAddress(userAddress);
      const wallet = await this.prisma.wallet.findUnique({
        where: { address: normalizedAddress },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for address: ${userAddress}`);
      }

      // Create transfer record
      const transferHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'address', 'uint256', 'uint256', 'uint256'],
          [
            userAddress,
            recipientAddress,
            amountBigInt,
            destinationChainId,
            Date.now(),
          ],
        ),
      );

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
          status: TransferStatus.LOCKED,
        },
      });

      logger.info(
        `Cross-chain transfer initiated: ${transferHash} from chain ${sourceChainId} to ${destinationChainId}`,
      );

      // Frontend will execute the blockchain transaction via MetaMask
      // and then call updateTransferStatus endpoint with the txHash
      return transfer;
    } catch (error) {
      logger.error('Cross-chain transfer initiation failed:', error);
      throw error;
    }
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<Transfer> {
    try {
      const transfer = await this.prisma.transfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new BadRequestException('Transfer not found');
      }

      return transfer;
    } catch (error) {
      logger.error('Failed to get transfer status:', error);
      throw error;
    }
  }

  /**
   * Get user transfers
   */
  async getUserTransfers(userAddress: string): Promise<Transfer[]> {
    try {
      return await this.prisma.transfer.findMany({
        where: { userId: userAddress },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to get user transfers:', error);
      throw error;
    }
  }

  /**
   * Calculate transfer quote
   */
  async calculateQuote(
    amount: string,
    sourceChainId: number,
    destinationChainId: number,
    contractAddress: string,
  ): Promise<{
    amount: string;
    fee: string;
    netAmount: string;
    sourceChain: number;
    destinationChain: number;
  }> {
    try {
      const amountBigInt = ethers.parseEther(amount);

      const fee = await this.blockchainService.callContractFunction(
        sourceChainId,
        contractAddress,
        CHAINSYNC_ABI,
        'calculateFee',
        [amountBigInt],
      );

      const netAmount = amountBigInt - fee;

      return {
        amount: amountBigInt.toString(),
        fee: fee.toString(),
        netAmount: netAmount.toString(),
        sourceChain: sourceChainId,
        destinationChain: destinationChainId,
      };
    } catch (error) {
      logger.error('Failed to calculate quote:', error);
      throw error;
    }
  }

  /**
   * Update transfer status
   */
  async updateTransferStatus(
    transferId: string,
    status: TransferStatus,
    txHash?: string,
  ): Promise<Transfer> {
    try {
      return await this.prisma.transfer.update({
        where: { id: transferId },
        data: {
          status,
          txHash,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to update transfer status:', error);
      throw error;
    }
  }
}
