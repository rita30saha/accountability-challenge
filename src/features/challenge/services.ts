import {
  rpc,
  Networks,
  Transaction,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  Address,
} from "@stellar/stellar-sdk";
import { walletService } from "@/features/wallet/services";
import { Challenge, ChallengeStatus } from "./types";

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

export const CHALLENGE_MANAGER_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CHALLENGE_MANAGER_CONTRACT_ID || "";

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

  async sendTransaction(signedTx: Transaction): Promise<string> {
    const response = await this.server.sendTransaction(signedTx);
    if (response.status === "ERROR") {
      throw new Error(`Transaction failed to submit: ${JSON.stringify(response.errorResult)}`);
    }

    const txHash = response.hash;
    
    // Poll for status (max 15 retries with 1.5s interval)
    for (let i = 0; i < 15; i++) {
      try {
        const res = await fetch(SOROBAN_RPC_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTransaction",
            params: {
              hash: txHash,
            },
          }),
        });

        const json = await res.json();
        if (json.result) {
          const status = json.result.status;
          if (status === "SUCCESS") {
            return txHash;
          }
          if (status === "FAILED") {
            throw new Error("Transaction execution failed on ledger.");
          }
        }
      } catch (err: any) {
        console.warn(`Polling attempt ${i + 1} failed: ${err.message}. Retrying...`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    
    throw new Error("Transaction timeout while waiting for confirmation.");
  }
}

export const sorobanClient = new SorobanClient();

// --- HELPER UTILITIES ---

export function xlmToStroops(xlm: string): bigint {
  const parsed = parseFloat(xlm);
  if (isNaN(parsed) || parsed <= 0) return 0n;
  return BigInt(Math.floor(parsed * 10_000_000));
}

export function stroopsToXlm(stroops: string | bigint): string {
  const val = typeof stroops === "string" ? BigInt(stroops) : stroops;
  const integerPart = val / 10_000_000n;
  const fractionalPart = val % 10_000_000n;
  if (fractionalPart === 0n) {
    return integerPart.toString();
  }
  const fracStr = fractionalPart.toString().padStart(7, "0");
  const trimmedFrac = fracStr.replace(/0+$/, "");
  return `${integerPart}.${trimmedFrac}`;
}

function parseStatus(statusVal: any): ChallengeStatus {
  if (typeof statusVal === "string") {
    const s = statusVal.toLowerCase();
    if (s === "created") return ChallengeStatus.Created;
    if (s === "active") return ChallengeStatus.Active;
    if (s === "completed") return ChallengeStatus.Completed;
    if (s === "failed") return ChallengeStatus.Failed;
    if (s === "expired") return ChallengeStatus.Expired;
  }
  if (typeof statusVal === "object" && statusVal !== null) {
    const keys = Object.keys(statusVal);
    if (keys.length > 0) {
      const s = keys[0].toLowerCase();
      if (s === "created") return ChallengeStatus.Created;
      if (s === "active") return ChallengeStatus.Active;
      if (s === "completed") return ChallengeStatus.Completed;
      if (s === "failed") return ChallengeStatus.Failed;
      if (s === "expired") return ChallengeStatus.Expired;
    }
  }
  if (typeof statusVal === "number") {
    return statusVal as ChallengeStatus;
  }
  return ChallengeStatus.Created;
}

// --- VIEW METHODS (SIMULATED CALLS) ---

export async function queryContract(
  contractId: string,
  method: string,
  args: any[] = []
): Promise<any> {
  if (!contractId) {
    throw new Error("Contract ID is not configured.");
  }
  const contract = new Contract(contractId);
  const source = new Address("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHB"); // Dummy address

  const tx = new TransactionBuilder(
    await sorobanClient.getServer().getAccount(source.toString()),
    {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    }
  )
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await sorobanClient.getServer().simulateTransaction(tx);
  if ("error" in sim) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  if (sim.result) {
    return scValToNative(sim.result.retval);
  }
  return null;
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  try {
    const raw = await queryContract(
      CHALLENGE_MANAGER_CONTRACT_ID,
      "get_challenge",
      [nativeToScVal(BigInt(id), { type: "u64" })]
    );
    if (!raw) return null;

    return {
      id: raw.id.toString(),
      creator: raw.creator,
      title: raw.title.toString(),
      description: raw.description.toString(),
      amount: stroopsToXlm(raw.amount),
      deadline: Number(raw.deadline),
      partner: raw.partner,
      status: parseStatus(raw.status),
      createdAt: Number(raw.created_at),
    };
  } catch (error) {
    console.error(`Error fetching challenge ${id}:`, error);
    return null;
  }
}

export async function getAllChallenges(): Promise<Challenge[]> {
  const challenges: Challenge[] = [];
  let id = 1;
  const batchSize = 10;
  let keepGoing = true;

  while (keepGoing) {
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      promises.push(getChallenge((id + i).toString()));
    }
    const results = await Promise.all(promises);
    let foundNull = false;
    for (const challenge of results) {
      if (challenge) {
        challenges.push(challenge);
      } else {
        foundNull = true;
      }
    }
    if (foundNull) {
      keepGoing = false;
    }
    id += batchSize;
  }
  return challenges;
}

// --- WRITE METHODS (SUBMITTED TRANSACTION CALLS) ---

async function submitSorobanTransaction(
  senderAddress: string,
  contractId: string,
  method: string,
  args: any[]
): Promise<string> {
  if (!contractId) {
    throw new Error("Contract ID is not configured.");
  }
  
  // 1. Fetch source account from network
  const account = await sorobanClient.getServer().getAccount(senderAddress);

  // 2. Build Transaction with contract invocation
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: "100", // base fee, will be modified by assembly
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // 3. Simulate transaction to find footprints/fees
  const sim = await sorobanClient.getServer().simulateTransaction(tx);
  if ("error" in sim) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  // 4. Assemble the transaction footprints and fees
  const preparedTx = rpc.assembleTransaction(tx, sim).build();

  // 5. Sign using user's wallet via StellarWalletsKit
  const signedXdr = await walletService.signTransaction(preparedTx.toXDR());

  // 6. Submit to the ledger and await validation
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as Transaction;
  const txHash = await sorobanClient.sendTransaction(signedTx);
  return txHash;
}

export async function createChallengeContract(
  creator: string,
  partner: string,
  title: string,
  description: string,
  amountXlm: string,
  deadlineUnix: number
): Promise<string> {
  const amountStroops = xlmToStroops(amountXlm);
  return submitSorobanTransaction(
    creator,
    CHALLENGE_MANAGER_CONTRACT_ID,
    "create_challenge",
    [
      nativeToScVal(creator, { type: "address" }),
      nativeToScVal(partner, { type: "address" }),
      nativeToScVal(title, { type: "string" }),
      nativeToScVal(description, { type: "string" }),
      nativeToScVal(amountStroops, { type: "i128" }),
      nativeToScVal(BigInt(deadlineUnix), { type: "u64" }),
    ]
  );
}

export async function completeChallengeContract(
  partner: string,
  id: string
): Promise<string> {
  return submitSorobanTransaction(
    partner,
    CHALLENGE_MANAGER_CONTRACT_ID,
    "complete_challenge",
    [nativeToScVal(BigInt(id), { type: "u64" })]
  );
}

export async function failChallengeContract(
  caller: string,
  id: string
): Promise<string> {
  return submitSorobanTransaction(
    caller,
    CHALLENGE_MANAGER_CONTRACT_ID,
    "fail_challenge",
    [
      nativeToScVal(BigInt(id), { type: "u64" }),
      nativeToScVal(caller, { type: "address" }),
    ]
  );
}

export async function expireChallengeContract(
  caller: string,
  id: string
): Promise<string> {
  return submitSorobanTransaction(
    caller,
    CHALLENGE_MANAGER_CONTRACT_ID,
    "expire_challenge",
    [nativeToScVal(BigInt(id), { type: "u64" })]
  );
}
