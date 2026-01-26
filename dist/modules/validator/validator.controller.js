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
exports.ValidatorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const validator_service_1 = require("./validator.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const register_validator_dto_1 = require("./dto/register-validator.dto");
const add_stake_dto_1 = require("./dto/add-stake.dto");
let ValidatorController = class ValidatorController {
    constructor(validatorService) {
        this.validatorService = validatorService;
    }
    async registerValidator(dto, req) {
        return await this.validatorService.registerValidator(req.user.address, req.user.chainId, dto.stakeAmount, dto.contractAddress);
    }
    async addStake(dto, req) {
        return await this.validatorService.addStake(req.user.address, req.user.chainId, dto.amount, dto.contractAddress);
    }
    async getValidatorInfo(address, chainId, contractAddress) {
        return await this.validatorService.getValidatorInfo(address, chainId, contractAddress);
    }
    async getAllValidators(chainId, contractAddress) {
        return await this.validatorService.getAllValidators(chainId, contractAddress);
    }
    async getActiveValidatorsCount(chainId, contractAddress) {
        return await this.validatorService.getActiveValidatorsCount(chainId, contractAddress);
    }
    async isActiveValidator(address, chainId, contractAddress) {
        return await this.validatorService.isActiveValidator(address, chainId, contractAddress);
    }
    async getValidatorStake(address, chainId, contractAddress) {
        return await this.validatorService.getValidatorStake(address, chainId, contractAddress);
    }
};
exports.ValidatorController = ValidatorController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register as a validator' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Validator registered successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_validator_dto_1.RegisterValidatorDto, Object]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "registerValidator", null);
__decorate([
    (0, common_1.Post)('stake'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add stake to validator' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Stake added successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_stake_dto_1.AddStakeDto, Object]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "addStake", null);
__decorate([
    (0, common_1.Get)('info/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get validator information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Validator information',
    }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chainId')),
    __param(2, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "getValidatorInfo", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all validators' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all validators',
    }),
    __param(0, (0, common_1.Query)('chainId')),
    __param(1, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "getAllValidators", null);
__decorate([
    (0, common_1.Get)('active-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active validators count' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Number of active validators',
    }),
    __param(0, (0, common_1.Query)('chainId')),
    __param(1, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "getActiveValidatorsCount", null);
__decorate([
    (0, common_1.Get)('is-active/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if address is active validator' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Validator active status',
    }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chainId')),
    __param(2, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "isActiveValidator", null);
__decorate([
    (0, common_1.Get)('stake/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get validator stake' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Validator stake amount',
    }),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('chainId')),
    __param(2, (0, common_1.Query)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ValidatorController.prototype, "getValidatorStake", null);
exports.ValidatorController = ValidatorController = __decorate([
    (0, swagger_1.ApiTags)('Validators'),
    (0, common_1.Controller)('api/v1/validators'),
    __metadata("design:paramtypes", [validator_service_1.ValidatorService])
], ValidatorController);
//# sourceMappingURL=validator.controller.js.map