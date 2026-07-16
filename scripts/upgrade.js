const { execSync } = require("child_process");
const path = require("path");
const {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  Keypair,
} = require("@stellar/stellar-sdk");

const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

const server = new rpc.Server(SOROBAN_RPC_URL);

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    return execSync(cmd, { stdio: "pipe" }).toString().trim();
  } catch (err) {
    console.error(`Error executing command: ${cmd}`);
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

async function pollTx(hash) {
  for (let i = 0; i < 20; i++) {
    const res = await server.getTransaction(hash);
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return res;
    }
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction execution failed on ledger: ${hash}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Transaction timed out: ${hash}`);
}

async function upgradeContract(deployerKeypair, contractId, wasmHashHex) {
  const publicKey = deployerKeypair.publicKey();
  console.log(`Submitting upgrade request for contract: ${contractId}`);

  // Fetch deployer account
  const account = await server.getAccount(publicKey);
  
  // Format the 32-byte hex hash into the exact bytes format
  const wasmHashBuffer = Buffer.from(wasmHashHex, "hex");
  if (wasmHashBuffer.length !== 32) {
    throw new Error(`WASM Hash must be exactly 32 bytes (64 hex characters). Received: ${wasmHashHex}`);
  }

  const contract = new Contract(contractId);
  const upgradeOp = contract.call(
    "upgrade",
    nativeToScVal(wasmHashBuffer, { type: "bytes" })
  );

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(upgradeOp)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if ("error" in sim) {
    throw new Error(`Simulation failed during upgrade: ${sim.error}`);
  }

  const preparedTx = rpc.assembleTransaction(tx, sim).build();
  preparedTx.sign(deployerKeypair);

  console.log("Submitting contract upgrade transaction...");
  const response = await server.sendTransaction(preparedTx);
  if (response.status === "ERROR") {
    throw new Error(`Upgrade submission failed: ${JSON.stringify(response.errorResult)}`);
  }

  await pollTx(response.hash);
  console.log("Contract upgraded successfully!");
}

async function main() {
  const args = process.argv.slice(2);
  const contractType = args[0]; // 'manager' or 'escrow'
  const contractId = args[1];   // Deployed contract ID to upgrade

  if (!contractType || !contractId) {
    console.log("Usage: node scripts/upgrade.js <manager|escrow> <contract_id>");
    process.exit(1);
  }

  console.log(`=== Starting Upgrade for Deployed Contract ID: ${contractId} ===`);

  // 1. Rebuild Smart Contracts
  console.log("Rebuilding smart contracts to WASM...");
  runCmd("stellar contract build");

  let wasmPath = "";
  if (contractType === "manager") {
    wasmPath = path.resolve(__dirname, "../target/wasm32-unknown-unknown/release/challenge_manager.wasm");
  } else if (contractType === "escrow") {
    wasmPath = path.resolve(__dirname, "../target/wasm32-unknown-unknown/release/escrow.wasm");
  } else {
    console.error("Invalid contract type. Choose 'manager' or 'escrow'.");
    process.exit(1);
  }

  // 2. Fetch keys
  const deployerSecret = runCmd("stellar keys secret deployer");
  const deployerKeypair = Keypair.fromSecret(deployerSecret);

  // 3. Install new WASM bytecode on chain to get hash
  console.log("Installing new WASM contract bytecode to Testnet...");
  const wasmHashHex = runCmd(
    `stellar contract install --wasm "${wasmPath}" --source deployer --network testnet`
  );
  console.log(`New WASM Hash Hex: ${wasmHashHex}`);

  // 4. Programmatic Upgrade invocation
  await upgradeContract(deployerKeypair, contractId, wasmHashHex);

  console.log("\n=== Success! ===");
  console.log(`Contract upgraded to WASM bytecode hash ${wasmHashHex} successfully.`);
}

main().catch((err) => {
  console.error("Upgrade failed:", err);
  process.exit(1);
});
