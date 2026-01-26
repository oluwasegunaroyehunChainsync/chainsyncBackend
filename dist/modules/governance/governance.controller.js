"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const governance_service_1 = require("./governance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_proposal_dto_1 = require("./dto/create-proposal.dto");
const vote_on_proposal_dto_1 = require("./dto/vote-on-proposal.dto");
let GovernanceController = class GovernanceController {
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    async createProposal(dto, req) {
        return await this.governanceService.createProposal(req.user.address, req.user.chainId, dto.title, dto.description, dto.votingPeriod, dto.contractAddress);
    }
    async voteOnProposal(dto, req) {
        return await this.governanceService.voteOnProposal(req.user.address, req.user.chainId, dto.proposalId, dto.support, dto.contractAddress);
    }
    async getProposal(proposalId) {
        return await this.governanceService.getProposal(proposalId);
    }
    async getAllProposals() {
        return await this.governanceService.getAllProposals();
    }
    async getUserVotes(req) {
        return await this.governanceService.getUserVotes(req.user.address);
    }
    async getVotingPower(address, chainId, contractAddress) {
        return await this.governanceService.getVotingPower(address, chainId, contractAddress);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Post)('proposals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a proposal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Proposal created successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_proposal_dto_1.CreateProposalDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Post)('vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vote on a proposal' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Vote recorded successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vote_on_proposal_dto_1.VoteOnProposalDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "voteOnProposal", null);
__decorate([
    (0, common_1.Get)('proposals/:proposalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get proposal details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Proposal details',
    }),
    __param(0, (0, common_1.Param)('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getProposal", null);
__decorate([
    (0, common_1.Get)('proposals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all proposals' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all proposals',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getAllProposals", null);
__decorate([
    (0, common_1.Get)('votes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user votes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User votes',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getUserVotes", null);
__decorate([
    (0, common_1.Get)('voting-power/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get voting power' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Voting power amount',
    }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chainId')),
    __param(2, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getVotingPower", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, swagger_1.ApiTags)('Governance'),
    (0, common_1.Controller)('api/v1/governance'),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map