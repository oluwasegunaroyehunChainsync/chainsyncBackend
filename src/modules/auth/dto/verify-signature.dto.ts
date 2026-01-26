import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifySignatureDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'Signed message',
    example: 'Sign this message to authenticate with ChainSync...',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Signature from wallet',
    example: '0x1234567890abcdef...',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'Challenge nonce',
    example: '0x...',
  })
  @IsString()
  nonce: string;

  @ApiProperty({
    description: 'Blockchain chain ID',
    example: 1,
  })
  @IsNumber()
  chainId: number;
}
