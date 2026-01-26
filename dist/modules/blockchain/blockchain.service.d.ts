import { ethers, Contract, JsonRpcProvider } from 'ethers';
export declare class BlockchainService {
    private providers;
    private contracts;
    private chainRPCs;
    private contractAddresses;
    constructor();
    private initializeProviders;
    /**
     * Get provider for a specific chain
     */
    getProvider(chainId: number): JsonRpcProvider;
    /**
     * Get contract instance
     */
    getContract(chainId: number, contractAddress: string, abi: any, signerPrivateKey?: string): Contract;
    /**
     * Call contract function (read-only)
     */
    callContractFunction(chainId: number, contractAddress: string, abi: any, functionName: string, args?: any[]): Promise<any>;
    /**
     * Send contract transaction
     */
    sendContractTransaction(chainId: number, contractAddress: string, abi: any, functionName: string, args: any[], privateKey: string, gasLimit?: number): Promise<string>;
    /**
     * Get transaction receipt
     */
    getTransactionReceipt(chainId: number, txHash: string): Promise<ethers.TransactionReceipt>;
    /**
     * Get block number
     */
    getBlockNumber(chainId: number): Promise<number>;
    /**
     * Listen to contract events
     */
    listenToEvents(chainId: number, contractAddress: string, abi: any, eventName: string, callback: (event: any) => void): void;
    /**
     * Get token balance
     */
    getTokenBalance(chainId: number, tokenAddress: string, walletAddress: string, abi: any): Promise<string>;
    /**
     * Verify signature
     */
    verifySignature(message: string, signature: string, address: string): boolean;
    /**
     * Create message hash
     */
    createMessageHash(message: string): string;
    /**
     * Get chain info
     */
    getChainInfo(chainId: number): {
        chainId: number;
        name: string;
        rpcUrl: string;
    };
    /**
     * Get contract addresses for a specific chain
     */
    getContractAddresses(chainId: number): {
        chainSync: string;
        validatorRegistry: string;
        cstToken: string;
    };
}
//# sourceMappingURL=blockchain.service.d.ts.map