import { ValidatorService } from './validator.service';
import { RegisterValidatorDto } from './dto/register-validator.dto';
import { AddStakeDto } from './dto/add-stake.dto';
export declare class ValidatorController {
    private readonly validatorService;
    constructor(validatorService: ValidatorService);
    registerValidator(dto: RegisterValidatorDto, req: any): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        stake: string;
        joinedAt: Date;
        active: boolean;
        slashAmount: string;
        totalRewards: string;
    }>;
    addStake(dto: AddStakeDto, req: any): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        stake: string;
        joinedAt: Date;
        active: boolean;
        slashAmount: string;
        totalRewards: string;
    }>;
    getValidatorInfo(address: string, chainId: number, contractAddress: string): Promise<{
        address: string;
        stake: any;
        joinedAt: Date;
        active: any;
        slashAmount: any;
        totalRewards: string;
    }>;
    getAllValidators(chainId: number, contractAddress: string): Promise<any>;
    getActiveValidatorsCount(chainId: number, contractAddress: string): Promise<number>;
    isActiveValidator(address: string, chainId: number, contractAddress: string): Promise<boolean>;
    getValidatorStake(address: string, chainId: number, contractAddress: string): Promise<string>;
}
//# sourceMappingURL=validator.controller.d.ts.map