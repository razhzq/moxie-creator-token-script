# Moxie Creator Token Script

A standalone TypeScript script to create Solana SPL tokens with Meteora liquidity pools for Moxie creators.

## 🚀 Features

- ✅ **SPL Token Creation**: Creates tokens with Metaplex metadata
- ✅ **1 Billion Token Supply**: Mints exactly 1,000,000,000 tokens
- ✅ **Meteora Pool Integration**: Automatically creates CLMM pools with:
  - 125 million creator tokens (125,000,000)
  - 69 SOL
- ✅ **Pure On-Chain**: No database or external storage required
- ✅ **Configurable**: Command-line parameters for token name and symbol
- ✅ **Production Ready**: Comprehensive error handling and logging

## 📋 Prerequisites

### System Requirements
- **Node.js**: >= 18.0.0
- **npm** or **yarn**
- **TypeScript**: Automatically installed as dev dependency

### Wallet Requirements
- **Solana Wallet**: With private key as 64-byte array
- **SOL Balance**: Minimum ~70 SOL required:
  - 69 SOL for pool liquidity
  - ~1 SOL for transaction fees and rent

### RPC Access
- Mainnet RPC endpoint (free public or premium like Helius)

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd moxie-creator-token-script
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Required: Your wallet private key as JSON array
CURVE_WALLET_PRIVATE=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]

# Optional: Custom RPC endpoint
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-api-key
```

## 🎯 Usage

### Basic Usage
```bash
npm run create-token "<tokenName>" "<tokenSymbol>"
```

### Examples
```bash
# Create "Alice Creator" token with symbol "ALICE"
npm run create-token "Alice Creator" "ALICE"

# Create "Bob's Token" with symbol "BOB"
npm run create-token "Bob's Token" "BOB"

# Create token with shorter name
npm run create-token "Charlie" "CHAR"
```

### Alternative Commands
```bash
# Development mode
npm run dev "Token Name" "SYMBOL"

# Direct TypeScript execution
npx ts-node src/index.ts "Token Name" "SYMBOL"

# Build and run compiled version
npm run build
npm start "Token Name" "SYMBOL"
```

## 📊 Process Flow

1. **🔧 Configuration Loading**
   - Validates environment variables
   - Initializes Solana connection
   - Sets up wallet keypair

2. **🪙 Token Creation**
   - Creates SPL token with 8 decimals
   - Adds Metaplex metadata
   - Sets token name as "Moxie's {tokenName}"

3. **💰 Token Minting**
   - Mints 1,000,000,000 tokens to wallet
   - All tokens controlled by the script wallet

4. **🌊 Pool Creation**
   - Creates Meteora CLMM pool
   - Adds 125M tokens + 69 SOL as liquidity
   - Auto-calculates initial price ratio

## 📈 Output Example

```
🌟 Moxie Creator Token & Pool Creation Script
==================================================
✅ Configuration loaded successfully
🌐 RPC URL: https://mainnet.helius-rpc.com/?api-key=***
🪙 Token Supply: 1,000,000,000
🏊 Pool: 125,000,000 tokens + 69 SOL

🚀 Starting creator token creation process...
📛 Token Name: Alice Creator
🏷️  Token Symbol: ALICE
💰 Total Supply: 1,000,000,000 tokens
🏊 Pool: 125,000,000 tokens + 69 SOL

✅ Created mint: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
📝 Token metadata: { name: "Moxie's Alice Creator", symbol: "ALICE", ... }
✅ Created token metadata: 5KQwrPbwdL6PhXujxW37ce...
🪙 Minting 1000000000 tokens...
✅ Minted tokens! Transaction: 3Bxs4ThW8y4NyibM2GfDb...
🌊 Creating Meteora pool for token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
📋 Config account: 6A5NHCj1yF6urc9wZNe5Bc9jsRBqAsrxWdmEHDB9n2eJ
💰 Pool liquidity: 125,000,000 creator tokens + 69 SOL
✅ Created Meteora pool! Transaction: 4CkQwrPbwdL6PhXujxW37...
🌐 Explorer: https://explorer.solana.com/tx/4CkQwrPbwdL6PhXujxW37...

🎉 Successfully created creator token and pool!
🪙 Token Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU
🌐 Token Explorer: https://explorer.solana.com/address/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU?cluster=mainnet-beta
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CURVE_WALLET_PRIVATE` | ✅ Yes | - | Wallet private key as JSON array of 64 numbers |
| `SOLANA_RPC_URL` | ❌ No | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint |
| `MOXIE_DECIMALS` | ❌ No | `8` | Token decimal places |

### Token Parameters

| Parameter | Description | Constraints |
|-----------|-------------|-------------|
| `tokenName` | Display name for the token | Max 32 bytes (after "Moxie's " prefix) |
| `tokenSymbol` | Token symbol | Max 10 characters, auto-uppercased |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| Total Supply | 1,000,000,000 | Fixed token supply |
| Pool Tokens | 125,000,000 | Tokens added to liquidity pool |
| Pool SOL | 69 | SOL added to liquidity pool |
| Decimals | 8 | Token decimal places |

## 🔧 Development

### Project Structure
```
moxie-creator-token-script/
├── src/
│   ├── index.ts          # Main script file
│   └── config.ts         # Configuration management
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment template
└── README.md            # This file
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove compiled files
- `npm run dev` - Run in development mode with ts-node
- `npm run create-token` - Main script execution
- `npm start` - Run compiled JavaScript version

### Dependencies
- **Runtime**: `@solana/web3.js`, `@solana/spl-token`, `@meteora-ag/cp-amm-sdk`
- **Metadata**: `@metaplex-foundation/mpl-token-metadata`
- **Utils**: `@coral-xyz/anchor`, `dotenv`
- **Development**: `typescript`, `ts-node`, `@types/node`

## 🛡️ Security

- ✅ **Local Signing**: All transactions signed locally
- ✅ **No Key Exposure**: Private keys never logged or transmitted
- ✅ **Environment Isolation**: Sensitive data in environment variables
- ✅ **Input Validation**: Parameter validation before execution
- ✅ **Error Handling**: Comprehensive error management

## 🐛 Troubleshooting

### Common Issues

**❌ "CURVE_WALLET_PRIVATE environment variable is required"**
- Ensure `.env` file exists with valid `CURVE_WALLET_PRIVATE`
- Check that the array has exactly 64 numbers

**❌ "Insufficient funds" errors**
- Verify wallet has at least 70 SOL
- Check SOL balance: `solana balance <your-wallet-address>`

**❌ "Failed to get recent blockhash"**
- RPC endpoint may be down or rate-limited
- Try alternative RPC in `SOLANA_RPC_URL`

**❌ "No config accounts found"**
- Meteora pools may not be available
- Check network connectivity and RPC endpoint

### Debug Mode
Add verbose logging by modifying the script or checking transaction details on Solana Explorer.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review the troubleshooting section

---

**⚠️ Important**: This script operates on Solana mainnet and requires real SOL. Always test with small amounts first and ensure you understand the implications of token creation and liquidity provision. 