import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
export declare class GovernanceService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaService, blockchainService: BlockchainService);
    /**
     * Create proposal
     */
    createProposal(userAddress: string, chainId: number, title: string, description: string, votingPeriod: number, contractAddress: string, privateKey?: string): Promise<{
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
    /**
     * Vote on proposal
     */
    voteOnProposal(userAddress: string, chainId: number, proposalId: string, support: number, contractAddress: string, privateKey?: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        support: boolean;
        votingPower: string;
        proposalId: string;
    }>;
    /**
     * Get proposal
     */
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
    /**
     * Get all proposals
     */
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
    /**
     * Get user votes
     */
    getUserVotes(userAddress: string): Promise<({
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
    /**
     * Get voting power
     */
    getVotingPower(userAddress: string, chainId: number, contractAddress: string): Promise<string>;
}
//# sourceMappingURL=governance.service.d.ts.map