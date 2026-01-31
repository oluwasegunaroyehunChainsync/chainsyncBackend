import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// Configuration
// ============================================

const CONFIG = {
  ethereum: {
    rpc: process.env.ETHEREUM_RPC_URL || 'https://eth.public.blastapi.io',
    chainSync: process.env.ETHEREUM_CHAINSYNC_ADDRESS || '0x236484C9a7A37D6fb9eae83E8FfB1b34CB70a73B',
    chainId: 1,
  },
  base: {
    rpc: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    chainSync: process.env.BASE_CHAINSYNC_ADDRESS || '0x10ad8653eba86adB6da714f4bf17085D6CaD93f6',
    chainId: 8453,
  },
  pollInterval: parseInt(process.env.POLL_INTERVAL || '30000'),
  validatorKey: process.env.VALIDATOR_PRIVATE_KEY || '',
};

// Token address mappings (source chain -> destination chain)
const TOKEN_MAPPINGS: Record<number, Record<string, string>> = {
  // Ethereum -> Base mappings
  1: {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDT -> USDC
  },
  // Base -> Ethereum mappings
  8453: {
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  },
};

// ChainSync ABI
const CHAINSYNC_ABI = [
  'event TransferInitiated(bytes32 indexed transferId, address indexed user, address indexed token, uint256 amount, uint256 fee, uint256 sourceChain, uint256 destinationChain, address recipient)',
  'function relayTransfer(bytes32 transferId, address user, address token, uint256 amount, uint256 sourceChain, address recipient, string memory txHash) external',
  'function transfers(bytes32) external view returns (bytes32 id, address user, address token, uint256 amount, uint256 fee, uint256 sourceChain, uint256 destinationChain, address recipient, uint8 status, uint256 timestamp, string memory txHash)',
  'function validators(address) external view returns (bool)',
];

// ============================================
// Relay Service Class
// ============================================

class RelayService {
  private ethereumProvider: ethers.JsonRpcProvider;
  private baseProvider: ethers.JsonRpcProvider;
  private validatorWallet: ethers.Wallet;
  private ethereumChainSync: ethers.Contract;
  private baseChainSync: ethers.Contract;
  private processedTransfers: Set<string> = new Set();
  private lastEthereumBlock: number = 0;
  private lastBaseBlock: number = 0;

  constructor() {
    this.ethereumProvider = new ethers.JsonRpcProvider(CONFIG.ethereum.rpc);
    this.baseProvider = new ethers.JsonRpcProvider(CONFIG.base.rpc);

    if (!CONFIG.validatorKey) {
      throw new Error('VALIDATOR_PRIVATE_KEY is required');
    }
    this.validatorWallet = new ethers.Wallet(CONFIG.validatorKey);

    this.ethereumChainSync = new ethers.Contract(CONFIG.ethereum.chainSync, CHAINSYNC_ABI, this.ethereumProvider);
    this.baseChainSync = new ethers.Contract(CONFIG.base.chainSync, CHAINSYNC_ABI, this.baseProvider);

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║            ChainSync Relay Service Started                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`Validator: ${this.validatorWallet.address}`);
    console.log(`Ethereum ChainSync: ${CONFIG.ethereum.chainSync}`);
    console.log(`Base ChainSync: ${CONFIG.base.chainSync}`);
    console.log(`Poll Interval: ${CONFIG.pollInterval}ms\n`);
  }

  async start() {
    await this.verifyValidatorStatus();
    this.lastEthereumBlock = await this.ethereumProvider.getBlockNumber() - 100;
    this.lastBaseBlock = await this.baseProvider.getBlockNumber() - 100;
    console.log(`Starting from Ethereum block: ${this.lastEthereumBlock}`);
    console.log(`Starting from Base block: ${this.lastBaseBlock}\n`);
    this.pollForTransfers();
  }

  private async verifyValidatorStatus() {
    try {
      const isValidatorOnBase = await this.baseChainSync.validators(this.validatorWallet.address);
      console.log(`Validator on Base: ${isValidatorOnBase ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`Validator on Base: ⚠️ Could not verify (contract may not have validator check)`);
    }

    try {
      const isValidatorOnEth = await this.ethereumChainSync.validators(this.validatorWallet.address);
      console.log(`Validator on Ethereum: ${isValidatorOnEth ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`Validator on Ethereum: ⚠️ Could not verify (contract may not have validator check)`);
    }

    try {
      const baseBalance = await this.baseProvider.getBalance(this.validatorWallet.address);
      console.log(`Gas on Base: ${ethers.formatEther(baseBalance)} ETH`);
    } catch (e) {
      console.log(`Gas on Base: ⚠️ Could not check`);
    }

    try {
      const ethBalance = await this.ethereumProvider.getBalance(this.validatorWallet.address);
      console.log(`Gas on Ethereum: ${ethers.formatEther(ethBalance)} ETH`);
    } catch (e) {
      console.log(`Gas on Ethereum: ⚠️ Could not check`);
    }
    console.log('');
  }

  private async pollForTransfers() {
    console.log('🔄 Polling for cross-chain transfers...\n');
    while (true) {
      try {
        await this.checkEthereumTransfers();
        await this.checkBaseTransfers();
      } catch (error) {
        console.error('Polling error:', error);
      }
      await this.sleep(CONFIG.pollInterval);
    }
  }

  private async checkEthereumTransfers() {
    const currentBlock = await this.ethereumProvider.getBlockNumber();
    if (currentBlock <= this.lastEthereumBlock) return;

    const filter = this.ethereumChainSync.filters.TransferInitiated();
    const events = await this.ethereumChainSync.queryFilter(filter, this.lastEthereumBlock + 1, currentBlock);

    for (const event of events) {
      await this.processTransferEvent(event, 1);
    }
    this.lastEthereumBlock = currentBlock;
  }

  private async checkBaseTransfers() {
    const currentBlock = await this.baseProvider.getBlockNumber();
    if (currentBlock <= this.lastBaseBlock) return;

    const filter = this.baseChainSync.filters.TransferInitiated();
    const events = await this.baseChainSync.queryFilter(filter, this.lastBaseBlock + 1, currentBlock);

    for (const event of events) {
      await this.processTransferEvent(event, 8453);
    }
    this.lastBaseBlock = currentBlock;
  }

  private async processTransferEvent(event: ethers.EventLog | ethers.Log, sourceChainId: number) {
    const eventLog = event as ethers.EventLog;
    const transferId = eventLog.args[0] as string;
    const user = eventLog.args[1] as string;
    const sourceToken = eventLog.args[2] as string;
    const amount = eventLog.args[3] as bigint;
    const destinationChainId = Number(eventLog.args[6]);
    const recipient = eventLog.args[7] as string;

    if (this.processedTransfers.has(transferId)) return;
    if (destinationChainId === sourceChainId) return; // Same-chain transfer

    console.log(`\n📦 Cross-chain transfer detected!`);
    console.log(`   ID: ${transferId.slice(0, 18)}...`);
    console.log(`   ${sourceChainId === 1 ? 'Ethereum' : 'Base'} → ${destinationChainId === 1 ? 'Ethereum' : 'Base'}`);
    console.log(`   Amount: ${amount.toString()}`);

    const destToken = TOKEN_MAPPINGS[sourceChainId]?.[sourceToken];
    if (!destToken) {
      console.error(`   ❌ No token mapping for ${sourceToken}`);
      return;
    }

    try {
      if (destinationChainId === 8453) {
        await this.relayToChain(this.baseProvider, this.baseChainSync, transferId, user, destToken, amount, sourceChainId, recipient, event.transactionHash);
      } else if (destinationChainId === 1) {
        await this.relayToChain(this.ethereumProvider, this.ethereumChainSync, transferId, user, destToken, amount, sourceChainId, recipient, event.transactionHash);
      }
      this.processedTransfers.add(transferId);
    } catch (error: any) {
      console.error(`   ❌ Relay failed: ${error.message}`);
    }
  }

  private async relayToChain(
    provider: ethers.JsonRpcProvider,
    contract: ethers.Contract,
    transferId: string,
    user: string,
    token: string,
    amount: bigint,
    sourceChainId: number,
    recipient: string,
    txHash: string
  ) {
    const existing = await contract.transfers(transferId);
    if (existing.id !== ethers.ZeroHash) {
      console.log(`   ⏭️ Already relayed`);
      return;
    }

    const wallet = this.validatorWallet.connect(provider);
    const contractWithSigner = contract.connect(wallet) as ethers.Contract;

    const tx = await contractWithSigner.relayTransfer(transferId, user, token, amount, sourceChainId, recipient, txHash);
    console.log(`   📤 Tx: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Relayed successfully!`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const relay = new RelayService();
  await relay.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
