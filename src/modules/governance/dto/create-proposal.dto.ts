import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({
    description: 'Proposal title',
    example: 'Increase validator stake requirement',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Proposal description',
    example: 'This proposal aims to increase the minimum stake...',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Voting period in blocks',
    example: 50400,
  })
  @IsNumber()
  votingPeriod: number;

  @ApiProperty({
    description: 'Governance contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
