import { IsString, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStakeDto {
  @ApiProperty({
    description: 'Amount to add (in ether)',
    example: '5.0',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'ValidatorRegistry contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
