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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifySignatureDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class VerifySignatureDto {
}
exports.VerifySignatureDto = VerifySignatureDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet address',
        example: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], VerifySignatureDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Signed message',
        example: 'Sign this message to authenticate with ChainSync...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifySignatureDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Signature from wallet',
        example: '0x1234567890abcdef...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifySignatureDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Challenge nonce',
        example: '0x...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifySignatureDto.prototype, "nonce", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Blockchain chain ID',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifySignatureDto.prototype, "chainId", void 0);
//# sourceMappingURL=verify-signature.dto.js.map