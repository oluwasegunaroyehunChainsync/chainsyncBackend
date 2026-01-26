import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitiateSameChainTransferDto } from './dto/initiate-same-chain-transfer.dto';
import { InitiateCrossChainTransferDto } from './dto/initiate-cross-chain-transfer.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';

@ApiTags('Transfers')
@Controller('api/v1/transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('same-chain')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer tokens on the same chain' })
  @ApiResponse({
    status: 201,
    description: 'Transfer initiated successfully',
  })
  async initiateSameChainTransfer(
    @Body() dto: InitiateSameChainTransferDto,
    @Request() req: any,
  ) {
    return await this.transferService.initiateSameChainTransfer(
      req.user.address,
      dto.sourceChainId,
      dto.tokenAddress,
      dto.recipientAddress,
      dto.amount,
      dto.contractAddress,
    );
  }

  @Post('cross-chain')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate cross-chain transfer' })
  @ApiResponse({
    status: 201,
    description: 'Cross-chain transfer initiated successfully',
  })
  async initiateCrossChainTransfer(
    @Body() dto: InitiateCrossChainTransferDto,
    @Request() req: any,
  ) {
    return await this.transferService.initiateCrossChainTransfer(
      req.user.address,
      dto.sourceChainId,
      dto.destinationChainId,
      dto.tokenAddress,
      dto.recipientAddress,
      dto.amount,
      dto.contractAddress,
    );
  }

  @Get('quote')
  @ApiOperation({ summary: 'Calculate transfer quote' })
  @ApiResponse({
    status: 200,
    description: 'Transfer quote calculated',
  })
  async calculateQuote(@Query() dto: CalculateQuoteDto) {
    return await this.transferService.calculateQuote(
      dto.amount,
      dto.sourceChainId,
      dto.destinationChainId,
      dto.contractAddress,
    );
  }

  @Get(':transferId')
  @ApiOperation({ summary: 'Get transfer status' })
  @ApiResponse({
    status: 200,
    description: 'Transfer details',
  })
  async getTransferStatus(@Param('transferId') transferId: string) {
    return await this.transferService.getTransferStatus(transferId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transfers' })
  @ApiResponse({
    status: 200,
    description: 'List of user transfers',
  })
  async getUserTransfers(@Request() req: any) {
    return await this.transferService.getUserTransfers(req.user.address);
  }

  @Patch(':transferId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update transfer status with transaction hash' })
  @ApiResponse({
    status: 200,
    description: 'Transfer status updated',
  })
  async updateTransferStatus(
    @Param('transferId') transferId: string,
    @Body() body: { status: string; txHash: string },
  ) {
    return await this.transferService.updateTransferStatus(
      transferId,
      body.status as any,
      body.txHash,
    );
  }
}
