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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const logger_1 = require("../../common/logger/logger");
const ethers_1 = require("ethers");
let AuthService = class AuthService {
    constructor(jwtService, prisma, blockchainService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.blockchainService = blockchainService;
        this.challengeStore = new Map();
        // Clean up expired challenges every 5 minutes
        setInterval(() => this.cleanupExpiredChallenges(), 5 * 60 * 1000);
    }
    /**
     * Generate authentication challenge
     */
    async generateChallenge(address, chainId) {
        try {
            // Validate address
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid address');
            }
            const normalizedAddress = ethers_1.ethers.getAddress(address);
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
            logger_1.logger.info(`Challenge generated for ${normalizedAddress} on chain ${chainId}`);
            return {
                message,
                nonce,
                expiresIn: 600,
            };
        }
        catch (error) {
            logger_1.logger.error('Challenge generation failed:', error);
            throw error;
        }
    }
    /**
     * Verify signature and authenticate
     */
    async verifySignature(address, signature, message, nonce, chainId) {
        try {
            // Validate address
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid address');
            }
            const normalizedAddress = ethers_1.ethers.getAddress(address);
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
            const isValid = this.blockchainService.verifySignature(message, signature, normalizedAddress);
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
            const token = this.jwtService.sign({
                address: normalizedAddress,
                chainId,
                walletId: wallet.id,
            }, { expiresIn: '24h' });
            const refreshToken = this.jwtService.sign({
                address: normalizedAddress,
                chainId,
                walletId: wallet.id,
                type: 'refresh',
            }, { expiresIn: '7d' });
            logger_1.logger.info(`User authenticated: ${normalizedAddress}`);
            return {
                token,
                refreshToken,
                expiresIn: 86400, // 24 hours
            };
        }
        catch (error) {
            logger_1.logger.error('Signature verification failed:', error);
            throw error;
        }
    }
    /**
     * Refresh token
     */
    async refreshToken(refreshToken) {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }
            const token = this.jwtService.sign({
                address: decoded.address,
                chainId: decoded.chainId,
                walletId: decoded.walletId,
            }, { expiresIn: '24h' });
            return {
                token,
                expiresIn: 86400,
            };
        }
        catch (error) {
            logger_1.logger.error('Token refresh failed:', error);
            throw error;
        }
    }
    /**
     * Validate token
     */
    validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            logger_1.logger.error('Token validation failed:', error);
            return null;
        }
    }
    /**
     * Generate nonce
     */
    generateNonce() {
        return ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32));
    }
    /**
     * Clean up expired challenges
     */
    cleanupExpiredChallenges() {
        const now = Math.floor(Date.now() / 1000);
        for (const [nonce, challenge] of this.challengeStore.entries()) {
            if (challenge.expiresAt < now) {
                this.challengeStore.delete(nonce);
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService])
], AuthService);
//# sourceMappingURL=auth.service.js.map