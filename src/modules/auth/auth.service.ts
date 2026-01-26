import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  private challengeStore: Map<
    string,
    {
      message: string;
      address: string;
      chainId: number;
      expiresAt: number;
    }
  > = new Map();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {
    // Clean up expired challenges every 5 minutes
    setInterval(() => this.cleanupExpiredChallenges(), 5 * 60 * 1000);
  }

  /**
   * Generate authentication challenge
   */
  async generateChallenge(
    address: string,
    chainId: number,
  ): Promise<{
    message: string;
    nonce: string;
    expiresIn: number;
  }> {
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address');
      }

      const normalizedAddress = ethers.getAddress(address);
      const nonce = this.generateNonce();
      const timestamp = Math.floor(Date.now() / 1000);
      const expiresAt = timestamp + 600; // 10 minutes

      const message = `Sign this message to authenticate with ChainSync\n\nChain ID: ${chainId}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      this.challengeStore.set(nonce, {
        message,
        address: normalizedAddress,
        chainId,
        expiresAt,
      });

      logger.info(`Challenge generated for ${normalizedAddress} on chain ${chainId}`);

      return {
        message,
        nonce,
        expiresIn: 600,
      };
    } catch (error) {
      logger.error('Challenge generation failed:', error);
      throw error;
    }
  }

  /**
   * Verify signature and authenticate
   */
  async verifySignature(
    address: string,
    signature: string,
    message: string,
    nonce: string,
    chainId: number,
  ): Promise<{
    token: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address');
      }

      const normalizedAddress = ethers.getAddress(address);

      // Check challenge
      const challenge = this.challengeStore.get(nonce);
      if (!challenge) {
        throw new Error('Challenge not found or expired');
      }

      if (challenge.expiresAt < Math.floor(Date.now() / 1000)) {
        this.challengeStore.delete(nonce);
        throw new Error('Challenge expired');
      }

      if (challenge.address !== normalizedAddress) {
        throw new Error('Address mismatch');
      }

      if (challenge.chainId !== chainId) {
        throw new Error('Chain ID mismatch');
      }

      // Verify signature
      const isValid = this.blockchainService.verifySignature(
        message,
        signature,
        normalizedAddress,
      );

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Remove used challenge
      this.challengeStore.delete(nonce);

      // Get or create wallet
      let wallet = await this.prisma.wallet.findUnique({
        where: { address: normalizedAddress },
      });

      if (!wallet) {
        wallet = await this.prisma.wallet.create({
          data: {
            address: normalizedAddress,
            chainId,
            nonce: this.generateNonce(),
          },
        });
      }

      // Generate tokens
      const token = this.jwtService.sign(
        {
          address: normalizedAddress,
          chainId,
          walletId: wallet.id,
        },
        { expiresIn: '24h' },
      );

      const refreshToken = this.jwtService.sign(
        {
          address: normalizedAddress,
          chainId,
          walletId: wallet.id,
          type: 'refresh',
        },
        { expiresIn: '7d' },
      );

      logger.info(`User authenticated: ${normalizedAddress}`);

      return {
        token,
        refreshToken,
        expiresIn: 86400, // 24 hours
      };
    } catch (error) {
      logger.error('Signature verification failed:', error);
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    token: string;
    expiresIn: number;
  }> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const token = this.jwtService.sign(
        {
          address: decoded.address,
          chainId: decoded.chainId,
          walletId: decoded.walletId,
        },
        { expiresIn: '24h' },
      );

      return {
        token,
        expiresIn: 86400,
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Validate token
   */
  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      logger.error('Token validation failed:', error);
      return null;
    }
  }

  /**
   * Generate nonce
   */
  private generateNonce(): string {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  /**
   * Clean up expired challenges
   */
  private cleanupExpiredChallenges() {
    const now = Math.floor(Date.now() / 1000);
    for (const [nonce, challenge] of this.challengeStore.entries()) {
      if (challenge.expiresAt < now) {
        this.challengeStore.delete(nonce);
      }
    }
  }
}
