import dotenv from "dotenv";

dotenv.config();

export interface Config {
  // Solana configuration
  SOLANA_RPC_URL: string;
  SOL_MINT: string;
  MOXIE_DECIMALS: number;
  
  // Wallet configuration
  CURVE_WALLET_PRIVATE: number[];
  
  // Token configuration
  TOKEN_SUPPLY: number;
  POOL_CREATOR_TOKENS: number;
  POOL_SOL_AMOUNT: number;
  
  // Hardcoded token details
  TOKEN_NAME: string;
  TOKEN_SYMBOL: string;
}

class ConfigService {
  public readonly SOLANA_RPC_URL: string;
  public readonly SOL_MINT: string;
  public readonly MOXIE_DECIMALS: number;
  public readonly CURVE_WALLET_PRIVATE: number[];
  
  // Token constants
  public readonly TOKEN_SUPPLY: number = 1_000_000_000; // 1 billion tokens
  public readonly POOL_CREATOR_TOKENS: number = 125_000_000; // 125 million tokens for pool
  public readonly POOL_SOL_AMOUNT: number = 69; // 69 SOL for pool
  
  // Hardcoded token details - UPDATE THESE VALUES
  public readonly TOKEN_NAME: string = "Moxie's TORY"; // Replace with your desired token name
  public readonly TOKEN_SYMBOL: string = "TORY"; // Replace with your desired token symbol (max 10 chars)

  constructor() {
    // Solana configuration
    this.SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 
      process.env.SOLANA_CLUSTER_MAINNET || 
      "https://api.mainnet-beta.solana.com";
    
    this.SOL_MINT = "So11111111111111111111111111111111111111112"; // Native SOL mint address
    this.MOXIE_DECIMALS = parseInt(process.env.MOXIE_DECIMALS || "8");
    
    // Wallet configuration
    const curveWalletPrivate = process.env.CURVE_WALLET_PRIVATE;
    if (!curveWalletPrivate) {
      throw new Error("CURVE_WALLET_PRIVATE environment variable is required");
    }
    
    try {
      this.CURVE_WALLET_PRIVATE = JSON.parse(curveWalletPrivate);
      if (!Array.isArray(this.CURVE_WALLET_PRIVATE) || this.CURVE_WALLET_PRIVATE.length !== 64) {
        throw new Error("CURVE_WALLET_PRIVATE must be an array of 64 numbers");
      }
    } catch (error) {
      throw new Error(`Invalid CURVE_WALLET_PRIVATE format: ${error}`);
    }

    this.validateConfig();
  }

  private validateConfig() {
    const requiredVars = ["CURVE_WALLET_PRIVATE"];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`❌ Error: ${varName} environment variable is required`);
        process.exit(1);
      }
    }

    console.log("✅ Configuration loaded successfully");
    console.log(`🌐 RPC URL: ${this.SOLANA_RPC_URL}`);
    console.log(`🪙 Token Supply: ${this.TOKEN_SUPPLY.toLocaleString()}`);
    console.log(`🏊 Pool: ${this.POOL_CREATOR_TOKENS.toLocaleString()} tokens + ${this.POOL_SOL_AMOUNT} SOL`);
  }
}

export const config = new ConfigService(); 