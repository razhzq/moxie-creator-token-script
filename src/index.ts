import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
  Commitment
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getMint, Mint } from "@solana/spl-token";
import { config } from "./config";
import {
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "@coral-xyz/anchor";
import { CpAmm, MIN_SQRT_PRICE, MAX_SQRT_PRICE } from '@meteora-ag/cp-amm-sdk';

class CreatorTokenScript {
  private curveStoreKeypair: Keypair;
  private solConnection: Connection;

  constructor() {
    this.curveStoreKeypair = Keypair.fromSecretKey(new Uint8Array(config.CURVE_WALLET_PRIVATE));
    this.solConnection = new Connection(config.SOLANA_RPC_URL, { commitment: 'confirmed' });
  }

  async createSplToken(tokenName: string, tokenSymbol: string): Promise<PublicKey> {
    try {
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      );
      
      const mint = await createMint(
        this.solConnection,
        this.curveStoreKeypair,
        this.curveStoreKeypair.publicKey,
        this.curveStoreKeypair.publicKey,
        config.MOXIE_DECIMALS
      );

      console.log(`✅ Created mint: ${mint.toString()}`);

      // Enforce Metaplex constraints: name<=32 bytes, symbol<=10 bytes, uri<=200 bytes and non-empty
      const truncateUtf8 = (input: string, maxBytes: number): string => {
        let out = input || "";
        while (Buffer.byteLength(out, "utf8") > maxBytes) {
          out = out.slice(0, -1);
        }
        return out;
      };

      const metadataData = {
        name: truncateUtf8(`Moxie's ${tokenName}`, 32),
        symbol: truncateUtf8(tokenSymbol.toUpperCase(), 10),
        uri: "https://moxie.invalid/metadata.json",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      };

      console.log(`📝 Token metadata:`, {
        name: metadataData.name,
        symbol: metadataData.symbol,
        uri: metadataData.uri,
        nameLen: Buffer.byteLength(metadataData.name, "utf8"),
        symbolLen: Buffer.byteLength(metadataData.symbol, "utf8"),
        uriLen: Buffer.byteLength(metadataData.uri, "utf8"),
      });

      const metadataPDAAndBump = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
      
      const metadataPDA = metadataPDAAndBump[0];

      const createMetadataAccountInstruction =
        createCreateMetadataAccountV3Instruction({
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: this.curveStoreKeypair.publicKey,
          payer: this.curveStoreKeypair.publicKey,
          updateAuthority: this.curveStoreKeypair.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadataData,
            isMutable: true,
          },
        }
      );

      const transaction = new Transaction();
      transaction.add(createMetadataAccountInstruction);

      const transactionSignature = await sendAndConfirmTransaction(
        this.solConnection,
        transaction,
        [this.curveStoreKeypair]
      );

      console.log(`✅ Created token metadata: ${transactionSignature}`);
      return mint;
    } catch (error) {
      console.error("❌ Error creating SPL token:", error);
      throw error;
    }
  }

  async mintTokens(mintPublicKey: PublicKey, amount: number): Promise<string> {
    try {
      console.log(`🪙 Minting ${amount / Math.pow(10, config.MOXIE_DECIMALS)} tokens...`);
      
      const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.solConnection,
        this.curveStoreKeypair,
        mintPublicKey,
        this.curveStoreKeypair.publicKey,
        false,
        'confirmed',
        undefined,
        TOKEN_PROGRAM_ID
      );

      const signature = await mintTo(
        this.solConnection,
        this.curveStoreKeypair,
        mintPublicKey,
        destinationTokenAccount.address,
        this.curveStoreKeypair,
        amount,
        [],
        undefined,
        TOKEN_PROGRAM_ID
      );

      console.log(`✅ Minted tokens! Transaction: ${signature}`);
      return signature;
    } catch (error) {
      console.error("❌ Error minting tokens:", error);
      throw error;
    }
  }

  async createMeteoraPool(creatorTokenAddress: string): Promise<{ signature: string }> {
    try {
      console.log(`🌊 Creating Meteora pool for token: ${creatorTokenAddress}`);
      
      const cpAmm = new CpAmm(this.solConnection);
      const configAccounts = await cpAmm.getAllConfigs();
      
      if (!configAccounts || configAccounts.length === 0) {
        throw new Error('No config accounts found');
      }
      
      const firstConfig = configAccounts[0];
      if (!firstConfig) {
        throw new Error('First config account is undefined');
      }
      
      const configAccount = firstConfig.publicKey;
      console.log('📋 Config account:', configAccount.toString());

      // Fetch mint information
      const commitment: Commitment = 'confirmed';
      const tokenAMint: PublicKey = new PublicKey(creatorTokenAddress);
      const tokenBMint: PublicKey = new PublicKey(config.SOL_MINT);
      
      const tokenAMintInfo: Mint = await getMint(
        this.solConnection, 
        tokenAMint, 
        commitment, 
        TOKEN_PROGRAM_ID
      );
      const tokenBMintInfo: Mint = await getMint(
        this.solConnection, 
        tokenBMint, 
        commitment, 
        TOKEN_PROGRAM_ID
      );

      const tokenADecimal: number = tokenAMintInfo.decimals;
      const tokenBDecimal: number = tokenBMintInfo.decimals;

      // Calculate liquidity amounts - 125M creator tokens and 69 SOL
      const initAmountA = Math.floor(config.POOL_CREATOR_TOKENS * (10 ** tokenADecimal));
      const initAmountB = Math.floor(config.POOL_SOL_AMOUNT * (10 ** tokenBDecimal));

      console.log(`💰 Pool liquidity: ${config.POOL_CREATOR_TOKENS.toLocaleString()} creator tokens + ${config.POOL_SOL_AMOUNT} SOL`);
      console.log(`📊 Raw amounts: ${initAmountA} (tokenA) + ${initAmountB} (tokenB)`);

      const initialAmountA: BN = new BN(initAmountA.toString());
      const initialAmountB: BN = new BN(initAmountB.toString());

      const { initSqrtPrice, liquidityDelta } = cpAmm.preparePoolCreationParams({
        tokenAAmount: initialAmountA,
        tokenBAmount: initialAmountB,
        minSqrtPrice: MIN_SQRT_PRICE,
        maxSqrtPrice: MAX_SQRT_PRICE
      });

      const positionNftMint = Keypair.generate();

      const createPoolTx = await cpAmm.createPool({
        payer: this.curveStoreKeypair.publicKey,
        creator: this.curveStoreKeypair.publicKey,
        config: configAccount,
        positionNft: positionNftMint.publicKey,
        tokenAMint,
        tokenBMint,
        activationPoint: null,
        tokenAAmount: initialAmountA,
        tokenBAmount: initialAmountB,
        initSqrtPrice: initSqrtPrice,
        liquidityDelta: liquidityDelta,
        tokenAProgram: TOKEN_PROGRAM_ID,
        tokenBProgram: TOKEN_PROGRAM_ID
      });

      const { blockhash, lastValidBlockHeight } = await this.solConnection.getLatestBlockhash();
      const transaction = new Transaction();
      
      transaction.add(createPoolTx);
      transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight; 
      transaction.sign(this.curveStoreKeypair, positionNftMint);

      const signature = await sendAndConfirmTransaction(
        this.solConnection, 
        transaction, 
        [this.curveStoreKeypair, positionNftMint]
      );

      console.log(`✅ Created Meteora pool! Transaction: ${signature}`);
      console.log(`🌐 Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
      
      return { signature };
    } catch (error) {
      console.error("❌ Error creating Meteora pool:", error);
      throw error;
    }
  }

  async run(): Promise<void> {
    try {
      console.log(`\n🚀 Starting creator token creation process...`);
      console.log(`📛 Token Name: ${config.TOKEN_NAME}`);
      console.log(`🏷️  Token Symbol: ${config.TOKEN_SYMBOL}`);
      console.log(`💰 Total Supply: ${config.TOKEN_SUPPLY.toLocaleString()} tokens`);
      console.log(`🏊 Pool: ${config.POOL_CREATOR_TOKENS.toLocaleString()} tokens + ${config.POOL_SOL_AMOUNT} SOL\n`);

      // Step 1: Create the token
      const mint = await this.createSplToken(config.TOKEN_NAME, config.TOKEN_SYMBOL);
      
      // Step 2: Mint 1 billion tokens
      const totalSupplyWithDecimals = config.TOKEN_SUPPLY * Math.pow(10, config.MOXIE_DECIMALS);
      await this.mintTokens(mint, totalSupplyWithDecimals);
      
      // Step 3: Create Meteora pool
      await this.createMeteoraPool(mint.toString());
      
      console.log(`\n🎉 Successfully created creator token and pool!`);
      console.log(`🪙 Token Address: ${mint.toString()}`);
      console.log(`🌐 Token Explorer: https://explorer.solana.com/address/${mint.toString()}?cluster=mainnet-beta`);
      
    } catch (error) {
      console.error("❌ Script failed:", error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log("🌟 Moxie Creator Token & Pool Creation Script");
    console.log("=" .repeat(50));
    
    const script = new CreatorTokenScript();
    await script.run();
    
  } catch (error) {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  }
}

// Run the script if this is the main module
if (require.main === module) {
  main();
}

export { CreatorTokenScript }; 