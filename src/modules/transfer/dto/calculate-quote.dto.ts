import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateQuoteDto {
  @ApiProperty({
    description: 'Amount to transfer (in ether)',
    example: '1.5',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'Source chain ID',
    example: 1,
  })
  @IsNumber()
  sourceChainId: number;

  @ApiProperty({
    description: 'Destination chain ID',
    example: 137,
  })
  @IsNumber()
  destinationChainId: number;

  @ApiProperty({
    description: 'ChainSync contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
