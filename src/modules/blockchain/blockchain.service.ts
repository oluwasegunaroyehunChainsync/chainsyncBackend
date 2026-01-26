import { Injectable } from '@nestjs/common';
import { ethers, Contract, JsonRpcProvider, Wallet } from 'ethers';
import { logger } from '../../common/logger/logger';

interface ChainRPC {
  [chainId: number]: string;
}

@Injectable()
export class BlockchainService {
  private providers: Map<number, JsonRpcProvider> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private chainRPCs: ChainRPC = {
    31337: process.env.LOCALHOST_RPC_URL || 'http://127.0.0.1:8545',
    1: process.env.ETHEREUM_RPC_URL || 'https://eth.public.blastapi.io',
    137: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    42161: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    10: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    11155111: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/431555c0703a4385b753bf1b912fd846',
    421614: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    80002: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  };

  // Contract addresses per chain
  private contractAddresses: { [chainId: number]: { chainSync: string; validatorRegistry: string; cstToken: string } } = {
    31337: {
      chainSync: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
      validatorRegistry: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
      cstToken: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    },
    11155111: {
      chainSync: '0x67EB5641679A476CB408E201ed3CB087a2422352',
      validatorRegistry: '0xF2332CAeD0567DCF513359FD2788b3a63aC36175',
      cstToken: '0xd62684427bc5a8b7eaDa01E3484f1Fa8d4bcDacD',
    },
    421614: {
      chainSync: '0x67EB5641679A476CB408E201ed3CB087a2422352',
      validatorRegistry: '0xF2332CAeD0567DCF513359FD2788b3a63aC36175',
      cstToken: '0xd62684427bc5a8b7eaDa01E3484f1Fa8d4bcDacD',
    },
  };

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    Object.entries(this.chainRPCs).forEach(([chainId, rpcUrl]) => {
      try {
        // Skip localhost if not explicitly enabled (to avoid blocking on missing Hardhat node)
        if (parseInt(chainId) === 31337 && !process.env.ENABLE_LOCALHOST) {
          logger.info(`Skipping localhost provider (chain 31337) - set ENABLE_LOCALHOST=true to enable`);
          return;
        }

        // Use static network to avoid blocking on network detection
        const provider = new JsonRpcProvider(rpcUrl, parseInt(chainId), { staticNetwork: true });
        this.providers.set(parseInt(chainId), provider);
        logger.info(`Initialized provider for chain ${chainId}`);
      } catch (error) {
        logger.error(`Failed to initialize provider for chain ${chainId}:`, error);
      }
    });
  }

  /**
   * Get provider for a specific chain
   */
  getProvider(chainId: number): JsonRpcProvider {
    logger.info(`getProvider called with chainId: ${chainId} (type: ${typeof chainId})`);
    const provider = this.providers.get(chainId);
    if (!provider) {
      logger.error(`Provider not found for chainId ${chainId}. Available keys: ${Array.from(this.providers.keys()).join(', ')}`);
      throw new Error(`Provider not available for chain ${chainId}`);
    }
    logger.info(`Found provider for chain ${chainId}`);
    return provider;
  }

  /**
   * Get contract instance
   */
  getContract(
    chainId: number,
    contractAddress: string,
    abi: any,
    signerPrivateKey?: string,
  ): Contract {
    const provider = this.getProvider(chainId);

    if (signerPrivateKey) {
      const signer = new Wallet(signerPrivateKey, provider);
      return new Contract(contractAddress, abi, signer);
    }

    return new Contract(contractAddress, abi, provider);
  }

  /**
   * Call contract function (read-only)
   */
  async callContractFunction(
    chainId: number,
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[] = [],
  ): Promise<any> {
    try {
      logger.info(`callContractFunction called with chainId: ${chainId} (type: ${typeof chainId})`);
      logger.info(`Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
      const contract = this.getContract(chainId, contractAddress, abi);
      const result = await contract[functionName](...args);
      return result;
    } catch (error) {
      logger.error(`Contract call failed: ${functionName}`, error);
      throw error;
    }
  }

  /**
   * Send contract transaction
   */
  async sendContractTransaction(
    chainId: number,
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[],
    privateKey: string,
    gasLimit?: number,
  ): Promise<string> {
    try {
      const contract = this.getContract(
        chainId,
        contractAddress,
        abi,
        privateKey,
      );

      const tx = await contract[functionName](...args, {
        gasLimit: gasLimit || 500000,
      });

      const receipt = await tx.wait();
      logger.info(`Transaction sent: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      logger.error(`Transaction failed: ${functionName}`, error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(chainId: number, txHash: string) {
    try {
      const provider = this.getProvider(chainId);
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Failed to get transaction receipt: ${txHash}`, error);
      throw error;
    }
  }

  /**
   * Get block number
   */
  async getBlockNumber(chainId: number): Promise<number> {
    try {
      const provider = this.getProvider(chainId);
      return await provider.getBlockNumber();
    } catch (error) {
      logger.error(`Failed to get block number for chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  listenToEvents(
    chainId: number,
    contractAddress: string,
    abi: any,
    eventName: string,
    callback: (event: any) => void,
  ) {
    try {
      const contract = this.getContract(chainId, contractAddress, abi);
      contract.on(eventName, callback);
      logger.info(`Listening to ${eventName} events on chain ${chainId}`);
    } catch (error) {
      logger.error(`Failed to listen to events: ${eventName}`, error);
      throw error;
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(
    chainId: number,
    tokenAddress: string,
    walletAddress: string,
    abi: any,
  ): Promise<string> {
    try {
      const contract = this.getContract(chainId, tokenAddress, abi);
      const balance = await contract.balanceOf(walletAddress);
      return balance.toString();
    } catch (error) {
      logger.error(`Failed to get token balance:`, error);
      throw error;
    }
  }

  /**
   * Verify signature
   */
  verifySignature(message: string, signature: string, address: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      logger.error(`Signature verification failed:`, error);
      return false;
    }
  }

  /**
   * Create message hash
   */
  createMessageHash(message: string): string {
    return ethers.hashMessage(message);
  }

  /**
   * Get chain info
   */
  getChainInfo(chainId: number) {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      42161: 'Arbitrum One',
      10: 'Optimism',
      11155111: 'Sepolia Testnet',
      421614: 'Arbitrum Sepolia Testnet',
      80002: 'Mumbai Testnet',
      31337: 'Hardhat Local',
    };

    return {
      chainId,
      name: chainNames[chainId] || 'Unknown',
      rpcUrl: this.chainRPCs[chainId],
    };
  }

  /**
   * Get contract addresses for a specific chain
   */
  getContractAddresses(chainId: number) {
    const addresses = this.contractAddresses[chainId];
    if (!addresses) {
      logger.warn(`No contract addresses for chain ${chainId}, falling back to Hardhat`);
      return this.contractAddresses[31337];
    }
    return addresses;
  }
}
