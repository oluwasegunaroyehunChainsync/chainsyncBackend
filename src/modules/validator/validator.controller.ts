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
import { ValidatorService } from './validator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterValidatorDto } from './dto/register-validator.dto';
import { AddStakeDto } from './dto/add-stake.dto';

@ApiTags('Validators')
@Controller('api/v1/validators')
export class ValidatorController {
  constructor(private readonly validatorService: ValidatorService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as a validator' })
  @ApiResponse({
    status: 201,
    description: 'Validator registered successfully',
  })
  async registerValidator(
    @Body() dto: RegisterValidatorDto,
    @Request() req: any,
  ) {
    return await this.validatorService.registerValidator(
      req.user.address,
      req.user.chainId,
      dto.stakeAmount,
      dto.contractAddress,
    );
  }

  @Post('stake')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add stake to validator' })
  @ApiResponse({
    status: 201,
    description: 'Stake added successfully',
  })
  async addStake(@Body() dto: AddStakeDto, @Request() req: any) {
    return await this.validatorService.addStake(
      req.user.address,
      req.user.chainId,
      dto.amount,
      dto.contractAddress,
    );
  }

  @Get('info/:address')
  @ApiOperation({ summary: 'Get validator information' })
  @ApiResponse({
    status: 200,
    description: 'Validator information',
  })
  async getValidatorInfo(
    @Param('address') address: string,
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.validatorService.getValidatorInfo(
      address,
      chainId,
      contractAddress,
    );
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all validators' })
  @ApiResponse({
    status: 200,
    description: 'List of all validators',
  })
  async getAllValidators(
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.validatorService.getAllValidators(chainId, contractAddress);
  }

  @Get('active-count')
  @ApiOperation({ summary: 'Get active validators count' })
  @ApiResponse({
    status: 200,
    description: 'Number of active validators',
  })
  async getActiveValidatorsCount(
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.validatorService.getActiveValidatorsCount(
      chainId,
      contractAddress,
    );
  }

  @Get('is-active/:address')
  @ApiOperation({ summary: 'Check if address is active validator' })
  @ApiResponse({
    status: 200,
    description: 'Validator active status',
  })
  async isActiveValidator(
    @Param('address') address: string,
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.validatorService.isActiveValidator(
      address,
      chainId,
      contractAddress,
    );
  }

  @Get('stake/:address')
  @ApiOperation({ summary: 'Get validator stake' })
  @ApiResponse({
    status: 200,
    description: 'Validator stake amount',
  })
  async getValidatorStake(
    @Param('address') address: string,
    @Query('chainId') chainId: number,
    @Query('contractAddress') contractAddress: string,
  ) {
    return await this.validatorService.getValidatorStake(
      address,
      chainId,
      contractAddress,
    );
  }
}
