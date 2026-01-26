import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { VoteOnProposalDto } from './dto/vote-on-proposal.dto';

@ApiTags('Governance')
@Controller('api/v1/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('proposals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a proposal' })
  @ApiResponse({
    status: 201,
    description: 'Proposal created successfully',
  })
  async createProposal(
    @Body() dto: CreateProposalDto,
    @Request() req: any,
  ) {
    return await this.governanceService.createProposal(
      req.user.address,
      req.user.chainId,
      dto.title,
      dto.description,
      dto.votingPeriod,
      dto.contractAddress,
    );
  }

  @Post('vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a proposal' })
  @ApiResponse({
    status: 201,
    description: 'Vote recorded successfully',
  })
  async voteOnProposal(
    @Body() dto: VoteOnProposalDto,
    @Request() req: any,
  ) {
    return await this.governanceService.voteOnProposal(
      req.user.address,
      req.user.chainId,
      dto.proposalId,
      dto.support,
      dto.contractAddress,
    );
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get proposal details' })
  @ApiResponse({
    status: 200,
    description: 'Proposal details',
  })
  async getProposal(@Param('proposalId') proposalId: string) {
    return await this.governanceService.getProposal(proposalId);
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Get all proposals' })
  @ApiResponse({
    status: 200,
    description: 'List of all proposals',
  })
  async getAllProposals() {
    return await this.governanceService.getAllProposals();
  }

  @Get('votes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user votes' })
  @ApiResponse({
    status: 200,
    description: 'User votes',
  })
  async getUserVotes(@Request() req: any) {
    return await this.governanceService.getUserVotes(req.user.address);
  }

  @Get('voting-power/:address')
  @ApiOperation({ summary: 'Get voting power' })
  @ApiResponse({
    status: 200,
    description: 'Voting power amount',
  })
  async getVotingPower(
    @Param('address') address: string,
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.governanceService.getVotingPower(
      address,
      chainId,
      contractAddress,
    );
  }
}
