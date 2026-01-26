import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let blockchainService: BlockchainService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            verifySignature: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateChallenge', () => {
    it('should generate a challenge', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE';
      const chainId = 1;

      const result = await service.generateChallenge(address, chainId);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(600);
    });

    it('should throw error for invalid address', async () => {
      const invalidAddress = 'invalid-address';
      const chainId = 1;

      await expect(
        service.generateChallenge(invalidAddress, chainId),
      ).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const token = 'valid-token';
      const decoded = { address: '0x...', chainId: 1 };

      (jwtService.verify as jest.Mock).mockReturnValue(decoded);

      const result = service.validateToken(token);

      expect(result).toEqual(decoded);
    });

    it('should return null for invalid token', () => {
      const token = 'invalid-token';

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
