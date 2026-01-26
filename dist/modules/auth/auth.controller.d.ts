import { AuthService } from './auth.service';
import { GenerateChallengeDto } from './dto/generate-challenge.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    generateChallenge(dto: GenerateChallengeDto): Promise<{
        message: string;
        nonce: string;
        expiresIn: number;
    }>;
    verifySignature(dto: VerifySignatureDto): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        token: string;
        expiresIn: number;
    }>;
    getCurrentUser(req: any): Promise<{
        address: any;
        chainId: any;
        walletId: any;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map