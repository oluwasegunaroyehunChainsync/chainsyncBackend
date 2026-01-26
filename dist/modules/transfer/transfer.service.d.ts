import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Transfer, TransferStatus } from '@prisma/client';
export declare class TransferService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    /**
     * Initiate same-chain transfer
     * Note: Blockchain transaction is executed on frontend via MetaMask
     */
    initiateSameChainTransfer(userAddress: string, chainId: number, tokenAddress: string, recipientAddress: string, amount: string, contractAddress: string): Promise<Transfer>;
    /**
     * Initiate cross-chain transfer
     * Note: Blockchain transaction is executed on frontend via MetaMask
     */
    initiateCrossChainTransfer(userAddress: string, sourceChainId: number, destinationChainId: number, tokenAddress: string, recipientAddress: string, amount: string, contractAddress: string): Promise<Transfer>;
    /**
     * Get transfer status
     */
    getTransferStatus(transferId: string): Promise<Transfer>;
    /**
     * Get user transfers
     */
    getUserTransfers(userAddress: string): Promise<Transfer[]>;
    /**
     * Calculate transfer quote
     */
    calculateQuote(amount: string, sourceChainId: number, destinationChainId: number, contractAddress: string): Promise<{
        amount: string;
        fee: string;
        netAmount: string;
        sourceChain: number;
        destinationChain: number;
    }>;
    /**
     * Update transfer status
     */
    updateTransferStatus(transferId: string, status: TransferStatus, txHash?: string): Promise<Transfer>;
}
//# sourceMappingURL=transfer.service.d.ts.map