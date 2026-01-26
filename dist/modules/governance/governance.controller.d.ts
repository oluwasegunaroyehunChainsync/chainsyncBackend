import { GovernanceService } from './governance.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { VoteOnProposalDto } from './dto/vote-on-proposal.dto';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    createProposal(dto: CreateProposalDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        votesFor: string;
        votesAgainst: string;
        startBlock: number;
        endBlock: number;
    }>;
    voteOnProposal(dto: VoteOnProposalDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        support: boolean;
        votingPower: string;
        proposalId: string;
    }>;
    getProposal(proposalId: string): Promise<{
        forVotes: number;
        againstVotes: number;
        totalVotes: number;
        votes: {
            id: string;
            createdAt: Date;
            walletId: string;
            support: boolean;
            votingPower: string;
            proposalId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        votesFor: string;
        votesAgainst: string;
        startBlock: number;
        endBlock: number;
    }>;
    getAllProposals(): Promise<{
        forVotes: number;
        againstVotes: number;
        totalVotes: number;
        votes: {
            id: string;
            createdAt: Date;
            walletId: string;
            support: boolean;
            votingPower: string;
            proposalId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        status: import(".prisma/client").$Enums.ProposalStatus;
        votesFor: string;
        votesAgainst: string;
        startBlock: number;
        endBlock: number;
    }[]>;
    getUserVotes(req: any): Promise<({
        proposal: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            title: string;
            status: import(".prisma/client").$Enums.ProposalStatus;
            votesFor: string;
            votesAgainst: string;
            startBlock: number;
            endBlock: number;
        };
    } & {
        id: string;
        createdAt: Date;
        walletId: string;
        support: boolean;
        votingPower: string;
        proposalId: string;
    })[]>;
    getVotingPower(address: string, chainId: number, contractAddress: string): Promise<string>;
}
//# sourceMappingURL=governance.controller.d.ts.map