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
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const logger_1 = require("../../common/logger/logger");
let BlockchainService = class BlockchainService {
    constructor() {
        this.providers = new Map();
        this.contracts = new Map();
        this.chainRPCs = {
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
        this.contractAddresses = {
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
        this.initializeProviders();
    }
    initializeProviders() {
        Object.entries(this.chainRPCs).forEach(([chainId, rpcUrl]) => {
            try {
                // Skip localhost if not explicitly enabled (to avoid blocking on missing Hardhat node)
                if (parseInt(chainId) === 31337 && !process.env.ENABLE_LOCALHOST) {
                    logger_1.logger.info(`Skipping localhost provider (chain 31337) - set ENABLE_LOCALHOST=true to enable`);
                    return;
                }
                // Use static network to avoid blocking on network detection
                const provider = new ethers_1.JsonRpcProvider(rpcUrl, parseInt(chainId), { staticNetwork: true });
                this.providers.set(parseInt(chainId), provider);
                logger_1.logger.info(`Initialized provider for chain ${chainId}`);
            }
            catch (error) {
                logger_1.logger.error(`Failed to initialize provider for chain ${chainId}:`, error);
            }
        });
    }
    /**
     * Get provider for a specific chain
     */
    getProvider(chainId) {
        logger_1.logger.info(`getProvider called with chainId: ${chainId} (type: ${typeof chainId})`);
        const provider = this.providers.get(chainId);
        if (!provider) {
            logger_1.logger.error(`Provider not found for chainId ${chainId}. Available keys: ${Array.from(this.providers.keys()).join(', ')}`);
            throw new Error(`Provider not available for chain ${chainId}`);
        }
        logger_1.logger.info(`Found provider for chain ${chainId}`);
        return provider;
    }
    /**
     * Get contract instance
     */
    getContract(chainId, contractAddress, abi, signerPrivateKey) {
        const provider = this.getProvider(chainId);
        if (signerPrivateKey) {
            const signer = new ethers_1.Wallet(signerPrivateKey, provider);
            return new ethers_1.Contract(contractAddress, abi, signer);
        }
        return new ethers_1.Contract(contractAddress, abi, provider);
    }
    /**
     * Call contract function (read-only)
     */
    async callContractFunction(chainId, contractAddress, abi, functionName, args = []) {
        try {
            logger_1.logger.info(`callContractFunction called with chainId: ${chainId} (type: ${typeof chainId})`);
            logger_1.logger.info(`Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
            const contract = this.getContract(chainId, contractAddress, abi);
            const result = await contract[functionName](...args);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Contract call failed: ${functionName}`, error);
            throw error;
        }
    }
    /**
     * Send contract transaction
     */
    async sendContractTransaction(chainId, contractAddress, abi, functionName, args, privateKey, gasLimit) {
        try {
            const contract = this.getContract(chainId, contractAddress, abi, privateKey);
            const tx = await contract[functionName](...args, {
                gasLimit: gasLimit || 500000,
            });
            const receipt = await tx.wait();
            logger_1.logger.info(`Transaction sent: ${receipt.hash}`);
            return receipt.hash;
        }
        catch (error) {
            logger_1.logger.error(`Transaction failed: ${functionName}`, error);
            throw error;
        }
    }
    /**
     * Get transaction receipt
     */
    async getTransactionReceipt(chainId, txHash) {
        try {
            const provider = this.getProvider(chainId);
            return await provider.getTransactionReceipt(txHash);
        }
        catch (error) {
            logger_1.logger.error(`Failed to get transaction receipt: ${txHash}`, error);
            throw error;
        }
    }
    /**
     * Get block number
     */
    async getBlockNumber(chainId) {
        try {
            const provider = this.getProvider(chainId);
            return await provider.getBlockNumber();
        }
        catch (error) {
            logger_1.logger.error(`Failed to get block number for chain ${chainId}:`, error);
            throw error;
        }
    }
    /**
     * Listen to contract events
     */
    listenToEvents(chainId, contractAddress, abi, eventName, callback) {
        try {
            const contract = this.getContract(chainId, contractAddress, abi);
            contract.on(eventName, callback);
            logger_1.logger.info(`Listening to ${eventName} events on chain ${chainId}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to listen to events: ${eventName}`, error);
            throw error;
        }
    }
    /**
     * Get token balance
     */
    async getTokenBalance(chainId, tokenAddress, walletAddress, abi) {
        try {
            const contract = this.getContract(chainId, tokenAddress, abi);
            const balance = await contract.balanceOf(walletAddress);
            return balance.toString();
        }
        catch (error) {
            logger_1.logger.error(`Failed to get token balance:`, error);
            throw error;
        }
    }
    /**
     * Verify signature
     */
    verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            logger_1.logger.error(`Signature verification failed:`, error);
            return false;
        }
    }
    /**
     * Create message hash
     */
    createMessageHash(message) {
        return ethers_1.ethers.hashMessage(message);
    }
    /**
     * Get chain info
     */
    getChainInfo(chainId) {
        const chainNames = {
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
    getContractAddresses(chainId) {
        const addresses = this.contractAddresses[chainId];
        if (!addresses) {
            logger_1.logger.warn(`No contract addresses for chain ${chainId}, falling back to Hardhat`);
            return this.contractAddresses[31337];
        }
        return addresses;
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map