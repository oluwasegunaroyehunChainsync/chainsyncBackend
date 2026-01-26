import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('challenge')
  @ApiOperation({ summary: 'Generate authentication challenge' })
  @ApiResponse({
    status: 201,
    description: 'Challenge generated successfully',
    schema: {
      example: {
        message: 'Sign this message to authenticate...',
        nonce: '0x...',
        expiresIn: 600,
      },
    },
  })
  async generateChallenge(@Body() dto: GenerateChallengeDto) {
    return await this.authService.generateChallenge(dto.address, dto.chainId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify signature and authenticate' })
  @ApiResponse({
    status: 201,
    description: 'Signature verified, tokens issued',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 86400,
      },
    },
  })
  async verifySignature(@Body() dto: VerifySignatureDto) {
    return await this.authService.verifySignature(
      dto.address,
      dto.signature,
      dto.message,
      dto.nonce,
      dto.chainId,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 201,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 86400,
      },
    },
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User information',
    schema: {
      example: {
        address: '0x...',
        chainId: 1,
        walletId: 'cuid...',
      },
    },
  })
  async getCurrentUser(@Request() req: any) {
    return {
      address: req.user.address,
      chainId: req.user.chainId,
      walletId: req.user.walletId,
    };
  }
}
