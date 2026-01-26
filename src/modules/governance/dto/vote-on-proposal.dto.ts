import { IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteOnProposalDto {
  @ApiProperty({
    description: 'Proposal ID',
    example: '1',
  })
  @IsString()
  proposalId: string;

  @ApiProperty({
    description: 'Vote support (1 = FOR, 0 = AGAINST)',
    example: 1,
  })
  @IsNumber()
  support: number;

  @ApiProperty({
    description: 'Governance contract address',
    example: '0x...',
  })
  @IsEthereumAddress()
  contractAddress: string;
}
