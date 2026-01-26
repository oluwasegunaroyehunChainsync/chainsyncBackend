"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ChainSync API')
        .setDescription('ChainSync - Universal Cross-Chain Settlement Layer\n\n' +
        'A production-grade API for same-chain and cross-chain token transfers.\n\n' +
        '**Key Features:**\n' +
        '- Web3 wallet authentication with signature verification\n' +
        '- Same-chain token transfers\n' +
        '- Cross-chain token transfers\n' +
        '- Validator management and staking\n' +
        '- Governance and voting\n' +
        '- Real-time transfer tracking\n\n' +
        '**Authentication:**\n' +
        'All protected endpoints require a JWT token obtained through Web3 authentication.\n' +
        '1. Call `POST /api/v1/auth/challenge` to get a message to sign\n' +
        '2. Sign the message with your wallet\n' +
        '3. Call `POST /api/v1/auth/verify` with the signature\n' +
        '4. Use the returned token in the Authorization header: `Bearer {token}`\n\n' +
        '**Chains Supported:**\n' +
        '- Ethereum Mainnet (1)\n' +
        '- Polygon (137)\n' +
        '- Arbitrum One (42161)\n' +
        '- Optimism (10)\n' +
        '- Sepolia Testnet (11155111)\n' +
        '- Mumbai Testnet (80002)')
        .setVersion('1.0.0')
        .addTag('Health', 'System health and status endpoints')
        .addTag('Auth', 'Web3 authentication endpoints')
        .addTag('Transfers', 'Token transfer endpoints')
        .addTag('Validators', 'Validator management endpoints')
        .addTag('Governance', 'Governance and voting endpoints')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
    }, 'BearerAuth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayOperationId: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
        },
    });
}
//# sourceMappingURL=swagger.js.map