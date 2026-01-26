import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateCrossChainTransferDto {
  @ApiProperty({
    description: 'Token contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  tokenAddress: string;

  @ApiProperty({
    description: 'Recipient address on destination chain',
    example: '0x...',
  })
  @IsEthereumAddress()
  recipientAddress: string;

  @ApiProperty({
    description: 'Source chain ID',
    example: 11155111,
  })
  @IsNumber()
  sourceChainId: number;

  @ApiProperty({
    description: 'Destination chain ID',
    example: 421614,
  })
  @IsNumber()
  destinationChainId: number;

  @ApiProperty({
    description: 'Amount to transfer (in ether)',
    example: '1.5',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'ChainSync contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
