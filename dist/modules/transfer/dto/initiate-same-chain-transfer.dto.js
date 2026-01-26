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
exports.InitiateSameChainTransferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class InitiateSameChainTransferDto {
}
exports.InitiateSameChainTransferDto = InitiateSameChainTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token contract address',
        example: '0x...',
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], InitiateSameChainTransferDto.prototype, "tokenAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient address',
        example: '0x...',
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], InitiateSameChainTransferDto.prototype, "recipientAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source chain ID',
        example: 11155111,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitiateSameChainTransferDto.prototype, "sourceChainId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to transfer (in ether)',
        example: '1.5',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateSameChainTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ChainSync contract address',
        example: '0x...',
    }),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], InitiateSameChainTransferDto.prototype, "contractAddress", void 0);
//# sourceMappingURL=initiate-same-chain-transfer.dto.js.map