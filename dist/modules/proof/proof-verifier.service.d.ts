interface Proof {
    type: 'SIGNATURE' | 'MERKLE' | 'ZK';
    data: string;
    validators: string[];
    threshold: number;
}
export declare class ProofVerifierService {
    /**
     * Verify signature proof
     * Ensures transaction was signed by the user
     */
    verifySignatureProof(message: string, signature: string, address: string): boolean;
    /**
     * Verify merkle proof
     * Ensures transfer is included in merkle tree
     */
    verifyMerkleProof(leaf: string, proof: string[], root: string): boolean;
    /**
     * Verify multi-signature proof
     * Ensures threshold of validators signed the transaction
     */
    verifyMultiSignatureProof(message: string, signatures: string[], validators: string[], threshold: number): boolean;
    /**
     * Verify cross-chain proof
     * Ensures transfer is valid on source chain
     */
    verifyCrossChainProof(transferId: string, sourceChain: number, destinationChain: number, proof: Proof): Promise<boolean>;
    /**
     * Generate merkle proof
     * Used for batch transfers
     */
    generateMerkleProof(transfers: string[], leafIndex: number): {
        proof: string[];
        root: string;
    };
    /**
     * Build merkle tree
     */
    private buildMerkleTree;
    /**
     * Get merkle proof for a leaf
     */
    private getMerkleProof;
    /**
     * Hash pair of values
     */
    private hashPair;
    /**
     * Verify transaction on blockchain
     */
    verifyTransactionOnChain(chainId: number, txHash: string, provider: any): Promise<boolean>;
}
export {};
//# sourceMappingURL=proof-verifier.service.d.ts.map