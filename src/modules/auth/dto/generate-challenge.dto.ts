import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateChallengeDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'Blockchain chain ID',
    example: 1,
  })
  @IsNumber()
  chainId: number;
}
