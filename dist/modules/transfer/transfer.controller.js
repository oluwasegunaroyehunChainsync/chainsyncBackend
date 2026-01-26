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
exports.TransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transfer_service_1 = require("./transfer.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const initiate_same_chain_transfer_dto_1 = require("./dto/initiate-same-chain-transfer.dto");
const initiate_cross_chain_transfer_dto_1 = require("./dto/initiate-cross-chain-transfer.dto");
const calculate_quote_dto_1 = require("./dto/calculate-quote.dto");
let TransferController = class TransferController {
    constructor(transferService) {
        this.transferService = transferService;
    }
    async initiateSameChainTransfer(dto, req) {
        return await this.transferService.initiateSameChainTransfer(req.user.address, dto.sourceChainId, dto.tokenAddress, dto.recipientAddress, dto.amount, dto.contractAddress);
    }
    async initiateCrossChainTransfer(dto, req) {
        return await this.transferService.initiateCrossChainTransfer(req.user.address, dto.sourceChainId, dto.destinationChainId, dto.tokenAddress, dto.recipientAddress, dto.amount, dto.contractAddress);
    }
    async calculateQuote(dto) {
        return await this.transferService.calculateQuote(dto.amount, dto.sourceChainId, dto.destinationChainId, dto.contractAddress);
    }
    async getTransferStatus(transferId) {
        return await this.transferService.getTransferStatus(transferId);
    }
    async getUserTransfers(req) {
        return await this.transferService.getUserTransfers(req.user.address);
    }
    async updateTransferStatus(transferId, body) {
        return await this.transferService.updateTransferStatus(transferId, body.status, body.txHash);
    }
};
exports.TransferController = TransferController;
__decorate([
    (0, common_1.Post)('same-chain'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer tokens on the same chain' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transfer initiated successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_same_chain_transfer_dto_1.InitiateSameChainTransferDto, Object]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "initiateSameChainTransfer", null);
__decorate([
    (0, common_1.Post)('cross-chain'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate cross-chain transfer' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Cross-chain transfer initiated successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_cross_chain_transfer_dto_1.InitiateCrossChainTransferDto, Object]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "initiateCrossChainTransfer", null);
__decorate([
    (0, common_1.Get)('quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate transfer quote' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer quote calculated',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_quote_dto_1.CalculateQuoteDto]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "calculateQuote", null);
__decorate([
    (0, common_1.Get)(':transferId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transfer status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer details',
    }),
    __param(0, (0, common_1.Param)('transferId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getTransferStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user transfers' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user transfers',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getUserTransfers", null);
__decorate([
    (0, common_1.Patch)(':transferId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update transfer status with transaction hash' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer status updated',
    }),
    __param(0, (0, common_1.Param)('transferId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "updateTransferStatus", null);
exports.TransferController = TransferController = __decorate([
    (0, swagger_1.ApiTags)('Transfers'),
    (0, common_1.Controller)('api/v1/transfers'),
    __metadata("design:paramtypes", [transfer_service_1.TransferService])
], TransferController);
//# sourceMappingURL=transfer.controller.js.map