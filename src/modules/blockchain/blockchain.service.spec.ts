import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProvider', () => {
    it('should get provider for supported chain', () => {
      const provider = service.getProvider(1);
      expect(provider).toBeDefined();
    });

    it('should throw error for unsupported chain', () => {
      expect(() => service.getProvider(999)).toThrow();
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const message = 'Test message';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE';

      // This is a mock - in real tests, you'd use actual signed messages
      const result = service.verifySignature(message, '0x...', address);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('getChainInfo', () => {
    it('should return chain info for supported chain', () => {
      const chainInfo = service.getChainInfo(1);

      expect(chainInfo).toHaveProperty('chainId');
      expect(chainInfo).toHaveProperty('name');
      expect(chainInfo).toHaveProperty('rpcUrl');
      expect(chainInfo.chainId).toBe(1);
    });
  });
});
