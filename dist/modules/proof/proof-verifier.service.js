"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofVerifierService = void 0;
const common_1 = require("@nestjs/common");
const logger_1 = require("../../common/logger/logger");
const ethers_1 = require("ethers");
let ProofVerifierService = class ProofVerifierService {
    /**
     * Verify signature proof
     * Ensures transaction was signed by the user
     */
    verifySignatureProof(message, signature, address) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            logger_1.logger.error('Signature verification failed:', error);
            return false;
        }
    }
    /**
     * Verify merkle proof
     * Ensures transfer is included in merkle tree
     */
    verifyMerkleProof(leaf, proof, root) {
        try {
            let hash = leaf;
            for (const proofElement of proof) {
                hash = this.hashPair(hash, proofElement);
            }
            return hash === root;
        }
        catch (error) {
            logger_1.logger.error('Merkle proof verification failed:', error);
            return false;
        }
    }
    /**
     * Verify multi-signature proof
     * Ensures threshold of validators signed the transaction
     */
    verifyMultiSignatureProof(message, signatures, validators, threshold) {
        try {
            if (signatures.length < threshold) {
                return false;
            }
            let validSignatures = 0;
            for (const signature of signatures) {
                try {
                    const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
                    if (validators.some((v) => v.toLowerCase() === recoveredAddress.toLowerCase())) {
                        validSignatures++;
                    }
                }
                catch {
                    // Invalid signature, continue
                }
            }
            return validSignatures >= threshold;
        }
        catch (error) {
            logger_1.logger.error('Multi-signature verification failed:', error);
            return false;
        }
    }
    /**
     * Verify cross-chain proof
     * Ensures transfer is valid on source chain
     */
    async verifyCrossChainProof(transferId, sourceChain, destinationChain, proof) {
        try {
            switch (proof.type) {
                case 'SIGNATURE':
                    return this.verifySignatureProof(transferId, proof.data, proof.validators[0]);
                case 'MERKLE':
                    // In production, verify against merkle root from source chain
                    return true;
                case 'ZK':
                    // In production, verify zero-knowledge proof
                    return true;
                default:
                    return false;
            }
        }
        catch (error) {
            logger_1.logger.error('Cross-chain proof verification failed:', error);
            return false;
        }
    }
    /**
     * Generate merkle proof
     * Used for batch transfers
     */
    generateMerkleProof(transfers, leafIndex) {
        try {
            const tree = this.buildMerkleTree(transfers);
            const proof = this.getMerkleProof(tree, leafIndex);
            const root = tree[tree.length - 1][0];
            return { proof, root };
        }
        catch (error) {
            logger_1.logger.error('Merkle proof generation failed:', error);
            throw error;
        }
    }
    /**
     * Build merkle tree
     */
    buildMerkleTree(leaves) {
        const tree = [leaves];
        while (tree[tree.length - 1].length > 1) {
            const currentLevel = tree[tree.length - 1];
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || currentLevel[i];
                nextLevel.push(this.hashPair(left, right));
            }
            tree.push(nextLevel);
        }
        return tree;
    }
    /**
     * Get merkle proof for a leaf
     */
    getMerkleProof(tree, leafIndex) {
        const proof = [];
        let index = leafIndex;
        for (let level = 0; level < tree.length - 1; level++) {
            const isLeftNode = index % 2 === 0;
            const siblingIndex = isLeftNode ? index + 1 : index - 1;
            if (siblingIndex < tree[level].length) {
                proof.push(tree[level][siblingIndex]);
            }
            index = Math.floor(index / 2);
        }
        return proof;
    }
    /**
     * Hash pair of values
     */
    hashPair(left, right) {
        const sorted = [left, right].sort();
        return ethers_1.ethers.keccak256(ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32'], sorted));
    }
    /**
     * Verify transaction on blockchain
     */
    async verifyTransactionOnChain(chainId, txHash, provider) {
        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            return receipt !== null && receipt.status === 1;
        }
        catch (error) {
            logger_1.logger.error('Transaction verification failed:', error);
            return false;
        }
    }
};
exports.ProofVerifierService = ProofVerifierService;
exports.ProofVerifierService = ProofVerifierService = __decorate([
    (0, common_1.Injectable)()
], ProofVerifierService);
//# sourceMappingURL=proof-verifier.service.js.map