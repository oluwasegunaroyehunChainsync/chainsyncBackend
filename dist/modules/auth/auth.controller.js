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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const generate_challenge_dto_1 = require("./dto/generate-challenge.dto");
const verify_signature_dto_1 = require("./dto/verify-signature.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async generateChallenge(dto) {
        return await this.authService.generateChallenge(dto.address, dto.chainId);
    }
    async verifySignature(dto) {
        return await this.authService.verifySignature(dto.address, dto.signature, dto.message, dto.nonce, dto.chainId);
    }
    async refreshToken(dto) {
        return await this.authService.refreshToken(dto.refreshToken);
    }
    async getCurrentUser(req) {
        return {
            address: req.user.address,
            chainId: req.user.chainId,
            walletId: req.user.walletId,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('challenge'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate authentication challenge' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Challenge generated successfully',
        schema: {
            example: {
                message: 'Sign this message to authenticate...',
                nonce: '0x...',
                expiresIn: 600,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_challenge_dto_1.GenerateChallengeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateChallenge", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify signature and authenticate' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Signature verified, tokens issued',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIs...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                expiresIn: 86400,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_signature_dto_1.VerifySignatureDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySignature", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Token refreshed successfully',
        schema: {
            example: {
                token: 'eyJhbGciOiJIUzI1NiIs...',
                expiresIn: 86400,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User information',
        schema: {
            example: {
                address: '0x...',
                chainId: 1,
                walletId: 'cuid...',
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map