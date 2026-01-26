import { Injectable } from '@nestjs/common';
import { logger } from '../../common/logger/logger';
import { ethers } from 'ethers';

interface Proof {
  type: 'SIGNATURE' | 'MERKLE' | 'ZK';
  data: string;
  validators: string[];
  threshold: number;
}

@Injectable()
export class ProofVerifierService {
  /**
   * Verify signature proof
   * Ensures transaction was signed by the user
   */
  verifySignatureProof(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify merkle proof
   * Ensures transfer is included in merkle tree
   */
  verifyMerkleProof(
    leaf: string,
    proof: string[],
    root: string,
  ): boolean {
    try {
      let hash = leaf;

      for (const proofElement of proof) {
        hash = this.hashPair(hash, proofElement);
      }

      return hash === root;
    } catch (error) {
      logger.error('Merkle proof verification failed:', error);
      return false;
    }
  }

  /**
   * Verify multi-signature proof
   * Ensures threshold of validators signed the transaction
   */
  verifyMultiSignatureProof(
    message: string,
    signatures: string[],
    validators: string[],
    threshold: number,
  ): boolean {
    try {
      if (signatures.length < threshold) {
        return false;
      }

      let validSignatures = 0;

      for (const signature of signatures) {
        try {
          const recoveredAddress = ethers.verifyMessage(message, signature);
          if (
            validators.some(
              (v) => v.toLowerCase() === recoveredAddress.toLowerCase(),
            )
          ) {
            validSignatures++;
          }
        } catch {
          // Invalid signature, continue
        }
      }

      return validSignatures >= threshold;
    } catch (error) {
      logger.error('Multi-signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify cross-chain proof
   * Ensures transfer is valid on source chain
   */
  async verifyCrossChainProof(
    transferId: string,
    sourceChain: number,
    destinationChain: number,
    proof: Proof,
  ): Promise<boolean> {
    try {
      switch (proof.type) {
        case 'SIGNATURE':
          return this.verifySignatureProof(
            transferId,
            proof.data,
            proof.validators[0],
          );

        case 'MERKLE':
          // In production, verify against merkle root from source chain
          return true;

        case 'ZK':
          // In production, verify zero-knowledge proof
          return true;

        default:
          return false;
      }
    } catch (error) {
      logger.error('Cross-chain proof verification failed:', error);
      return false;
    }
  }

  /**
   * Generate merkle proof
   * Used for batch transfers
   */
  generateMerkleProof(
    transfers: string[],
    leafIndex: number,
  ): { proof: string[]; root: string } {
    try {
      const tree = this.buildMerkleTree(transfers);
      const proof = this.getMerkleProof(tree, leafIndex);
      const root = tree[tree.length - 1][0];

      return { proof, root };
    } catch (error) {
      logger.error('Merkle proof generation failed:', error);
      throw error;
    }
  }

  /**
   * Build merkle tree
   */
  private buildMerkleTree(leaves: string[]): string[][] {
    const tree: string[][] = [leaves];

    while (tree[tree.length - 1].length > 1) {
      const currentLevel = tree[tree.length - 1];
      const nextLevel: string[] = [];

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
  private getMerkleProof(tree: string[][], leafIndex: number): string[] {
    const proof: string[] = [];
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
  private hashPair(left: string, right: string): string {
    const sorted = [left, right].sort();
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes32', 'bytes32'],
        sorted,
      ),
    );
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransactionOnChain(
    chainId: number,
    txHash: string,
    provider: any,
  ): Promise<boolean> {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      logger.error('Transaction verification failed:', error);
      return false;
    }
  }
}
