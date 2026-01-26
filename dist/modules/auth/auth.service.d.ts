import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class AuthService {
    private jwtService;
    private prisma;
    private blockchainService;
    private challengeStore;
    constructor(jwtService: JwtService, prisma: PrismaService, blockchainService: BlockchainService);
    /**
     * Generate authentication challenge
     */
    generateChallenge(address: string, chainId: number): Promise<{
        message: string;
        nonce: string;
        expiresIn: number;
    }>;
    /**
     * Verify signature and authenticate
     */
    verifySignature(address: string, signature: string, message: string, nonce: string, chainId: number): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * Refresh token
     */
    refreshToken(refreshToken: string): Promise<{
        token: string;
        expiresIn: number;
    }>;
    /**
     * Validate token
     */
    validateToken(token: string): any;
    /**
     * Generate nonce
     */
    private generateNonce;
    /**
     * Clean up expired challenges
     */
    private cleanupExpiredChallenges;
}
//# sourceMappingURL=auth.service.d.ts.map