import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class ValidatorService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    /**
     * Register as validator
     */
    registerValidator(address: string, chainId: number, stakeAmount: string, contractAddress: string, privateKey?: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        stake: string;
        joinedAt: Date;
        active: boolean;
        slashAmount: string;
        totalRewards: string;
    }>;
    /**
     * Add stake
     */
    addStake(address: string, chainId: number, amount: string, contractAddress: string, privateKey?: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        stake: string;
        joinedAt: Date;
        active: boolean;
        slashAmount: string;
        totalRewards: string;
    }>;
    /**
     * Get validator info
     */
    getValidatorInfo(address: string, chainId: number, contractAddress: string): Promise<{
        address: string;
        stake: any;
        joinedAt: Date;
        active: any;
        slashAmount: any;
        totalRewards: string;
    }>;
    /**
     * Get all validators
     */
    getAllValidators(chainId: number, contractAddress: string): Promise<any>;
    /**
     * Get active validators count
     */
    getActiveValidatorsCount(chainId: number, contractAddress: string): Promise<number>;
    /**
     * Check if address is active validator
     */
    isActiveValidator(address: string, chainId: number, contractAddress: string): Promise<boolean>;
    /**
     * Get validator stake
     */
    getValidatorStake(address: string, chainId: number, contractAddress: string): Promise<string>;
}
//# sourceMappingURL=validator.service.d.ts.map