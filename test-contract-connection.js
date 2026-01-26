const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses from .env
const CHAINSYNC_ADDRESS = process.env.CHAINSYNC_CONTRACT_ADDRESS;
const CST_TOKEN_ADDRESS = process.env.CST_TOKEN_ADDRESS;
const VALIDATOR_REGISTRY_ADDRESS = process.env.VALIDATOR_REGISTRY_ADDRESS;
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL;

// Basic ABIs for testing
const CST_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)"
];

const CHAINSYNC_ABI = [
  "function feePercentage() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function owner() view returns (address)",
  "function supportedTokens(address) view returns (bool)"
];

const VALIDATOR_REGISTRY_ABI = [
  "function minStake() view returns (uint256)",
  "function owner() view returns (address)",
  "function totalStaked() view returns (uint256)",
  "function getActiveValidatorsCount() view returns (uint256)"
];

async function testContractConnection() {
  console.log('🔗 Testing ChainSync Contract Connection\n');
  console.log('=' .repeat(60));

  try {
    // Connect to localhost network
    console.log(`\n📡 Connecting to: ${LOCALHOST_RPC_URL}`);
    const provider = new ethers.JsonRpcProvider(LOCALHOST_RPC_URL);

    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})\n`);

    // Test CST Token
    console.log('1️⃣  Testing CST Token Contract');
    console.log('-'.repeat(60));
    const cstToken = new ethers.Contract(CST_TOKEN_ADDRESS, CST_ABI, provider);

    const name = await cstToken.name();
    const symbol = await cstToken.symbol();
    const decimals = await cstToken.decimals();
    const totalSupply = await cstToken.totalSupply();
    const cstOwner = await cstToken.owner();

    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`   Owner: ${cstOwner}`);
    console.log(`   ✅ CST Token contract is accessible\n`);

    // Test ChainSync Contract
    console.log('2️⃣  Testing ChainSync Contract');
    console.log('-'.repeat(60));
    const chainSync = new ethers.Contract(CHAINSYNC_ADDRESS, CHAINSYNC_ABI, provider);

    const feePercentage = await chainSync.feePercentage();
    const feeRecipient = await chainSync.feeRecipient();
    const chainSyncOwner = await chainSync.owner();
    const isCSTSupported = await chainSync.supportedTokens(CST_TOKEN_ADDRESS);

    console.log(`   Fee Percentage: ${feePercentage} basis points (${Number(feePercentage) / 100}%)`);
    console.log(`   Fee Recipient: ${feeRecipient}`);
    console.log(`   Owner: ${chainSyncOwner}`);
    console.log(`   CST Token Supported: ${isCSTSupported}`);
    console.log(`   ✅ ChainSync contract is accessible\n`);

    // Test ValidatorRegistry Contract
    console.log('3️⃣  Testing ValidatorRegistry Contract');
    console.log('-'.repeat(60));
    const validatorRegistry = new ethers.Contract(
      VALIDATOR_REGISTRY_ADDRESS,
      VALIDATOR_REGISTRY_ABI,
      provider
    );

    const minStake = await validatorRegistry.minStake();
    const validatorOwner = await validatorRegistry.owner();
    const totalStaked = await validatorRegistry.totalStaked();
    const activeValidators = await validatorRegistry.getActiveValidatorsCount();

    console.log(`   Minimum Stake: ${ethers.formatEther(minStake)} ETH`);
    console.log(`   Owner: ${validatorOwner}`);
    console.log(`   Total Staked: ${ethers.formatEther(totalStaked)} ETH`);
    console.log(`   Active Validators: ${activeValidators}`);
    console.log(`   ✅ ValidatorRegistry contract is accessible\n`);

    // Summary
    console.log('=' .repeat(60));
    console.log('✅ ALL CONTRACTS ARE SUCCESSFULLY CONNECTED!\n');
    console.log('📋 Summary:');
    console.log(`   • CST Token: ${CST_TOKEN_ADDRESS}`);
    console.log(`   • ChainSync: ${CHAINSYNC_ADDRESS}`);
    console.log(`   • ValidatorRegistry: ${VALIDATOR_REGISTRY_ADDRESS}`);
    console.log(`   • Network: Localhost (Chain ID: ${network.chainId})`);
    console.log('\n🎉 Backend is ready to communicate with smart contracts!');

  } catch (error) {
    console.error('\n❌ Error testing contract connection:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testContractConnection();
