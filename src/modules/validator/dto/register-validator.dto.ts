import { IsString, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterValidatorDto {
  @ApiProperty({
    description: 'Stake amount (in ether)',
    example: '10.0',
  })
  @IsString()
  stakeAmount: string;

  @ApiProperty({
    description: 'ValidatorRegistry contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
