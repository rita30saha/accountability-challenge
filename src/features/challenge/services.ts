import { rpc, Networks, Transaction } from "@stellar/stellar-sdk";

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

export const CHALLENGE_MANAGER_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CHALLENGE_MANAGER_CONTRACT_ID || "";
export const ESCROW_CONTRACT_ID =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "";

export class SorobanClient {
  private server: rpc.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new rpc.Server(SOROBAN_RPC_URL);
    this.networkPassphrase = NETWORK_PASSPHRASE;
  }

  getServer(): rpc.Server {
    return this.server;
  }

  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  async sendTransaction(signedTx: Transaction): Promise<rpc.Api.GetTransactionResponse> {
    const response = await this.server.sendTransaction(signedTx);
    if (response.status === "ERROR") {
      throw new Error(`Transaction failed to submit: ${JSON.stringify(response.errorResult)}`);
    }

    const txHash = response.hash;
    
    // Poll for status (max 10 retries with 1.5s interval)
    for (let i = 0; i < 15; i++) {
      const txResult = await this.server.getTransaction(txHash);
      if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return txResult;
      }
      if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("Transaction execution failed on ledger.");
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    
    throw new Error("Transaction timeout while waiting for confirmation.");
  }
}

export const sorobanClient = new SorobanClient();
