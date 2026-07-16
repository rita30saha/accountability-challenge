const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  Keypair,
} = require("@stellar/stellar-sdk");

const NATIVE_TOKEN_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
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

function runCmdAllowError(cmd) {
  console.log(`Checking: ${cmd}`);
  try {
    return {
      output: execSync(cmd, { stdio: "pipe" }).toString().trim(),
      success: true
    };
  } catch (err) {
    return {
      error: err.stderr ? err.stderr.toString().trim() : err.message,
      success: false
    };
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

async function initializeContracts(deployerKeypair, managerId, escrowId, nativeTokenSac) {
  const publicKey = deployerKeypair.publicKey();
  console.log(`Initializing using admin/deployer address: ${publicKey}`);

  // 1. Fetch deployer account details
  const account = await server.getAccount(publicKey);

  // --- Initialize Escrow ---
  console.log("-----------------------------------------");
  console.log("Programmatically initializing Escrow Contract...");
  const escrowContract = new Contract(escrowId);
  const escrowOp = escrowContract.call(
    "initialize",
    nativeToScVal(managerId, { type: "address" }),
    nativeToScVal(nativeTokenSac, { type: "address" })
  );

  const escrowTx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(escrowOp)
    .setTimeout(30)
    .build();

  const escrowSim = await server.simulateTransaction(escrowTx);
  if ("error" in escrowSim) {
    throw new Error(`Escrow simulation failed: ${escrowSim.error}`);
  }

  const escrowPrepared = rpc.assembleTransaction(escrowTx, escrowSim).build();
  escrowPrepared.sign(deployerKeypair);

  console.log("Submitting Escrow initialization transaction...");
  const escrowResponse = await server.sendTransaction(escrowPrepared);
  if (escrowResponse.status === "ERROR") {
    throw new Error(`Escrow submission failed: ${JSON.stringify(escrowResponse.errorResult)}`);
  }

  await pollTx(escrowResponse.hash);
  console.log("Escrow contract initialized successfully!");

  // --- Initialize Challenge Manager ---
  console.log("-----------------------------------------");
  console.log("Programmatically initializing Challenge Manager Contract...");
  
  // Re-fetch account details to increment sequence number correctly
  const updatedAccount = await server.getAccount(publicKey);
  const managerContract = new Contract(managerId);
  const managerOp = managerContract.call(
    "initialize",
    nativeToScVal(publicKey, { type: "address" }),
    nativeToScVal(escrowId, { type: "address" }),
    nativeToScVal(nativeTokenSac, { type: "address" })
  );

  const managerTx = new TransactionBuilder(updatedAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(managerOp)
    .setTimeout(30)
    .build();

  const managerSim = await server.simulateTransaction(managerTx);
  if ("error" in managerSim) {
    throw new Error(`Challenge Manager simulation failed: ${managerSim.error}`);
  }

  const managerPrepared = rpc.assembleTransaction(managerTx, managerSim).build();
  managerPrepared.sign(deployerKeypair);

  console.log("Submitting Challenge Manager initialization transaction...");
  const managerResponse = await server.sendTransaction(managerPrepared);
  if (managerResponse.status === "ERROR") {
    throw new Error(`Challenge Manager submission failed: ${JSON.stringify(managerResponse.errorResult)}`);
  }

  await pollTx(managerResponse.hash);
  console.log("Challenge Manager contract initialized successfully!");
  console.log("-----------------------------------------");
}

async function main() {
  console.log("=== Starting Stellar Testnet Deployment ===");

  // 1. Configure Testnet in Stellar CLI
  console.log("Configuring Stellar Testnet network profile...");
  runCmd(
    'stellar network add --global testnet --rpc-url "https://soroban-testnet.stellar.org" --network-passphrase "Test SDF Network ; September 2015"'
  );

  // 2. Generate and fund deployer account if it doesn't exist
  console.log("Checking if deployer identity exists...");
  const checkKey = runCmdAllowError("stellar keys address deployer");
  if (!checkKey.success) {
    console.log("Generating deployer keypair (automatically funded via Friendbot)...");
    runCmd("stellar keys generate --network testnet deployer");
  } else {
    console.log(`Deployer identity 'deployer' already exists. Reusing: ${checkKey.output}`);
  }

  const deployerAddress = runCmd("stellar keys address deployer");
  const deployerSecret = runCmd("stellar keys secret deployer");
  const deployerKeypair = Keypair.fromSecret(deployerSecret);

  console.log(`Deployer Stellar Address: ${deployerAddress}`);

  // 3. Build Smart Contracts
  console.log("Building smart contracts to WASM...");
  runCmd("stellar contract build");

  // 4. Ensure Native SAC token exists
  console.log("Ensuring Native Stellar Asset Contract (SAC) is deployed...");
  let nativeTokenSac = NATIVE_TOKEN_SAC;
  try {
    const deployedSac = runCmd("stellar contract asset deploy --asset native --source deployer --network testnet");
    if (deployedSac && deployedSac.startsWith("C")) {
      nativeTokenSac = deployedSac;
    }
  } catch (e) {
    console.log(`Using native SAC fallback: ${nativeTokenSac}`);
  }

  // 5. Deploy Escrow Contract
  console.log("Deploying Escrow contract to Testnet...");
  const escrowWasmPath = path.resolve(
    __dirname,
    "../target/wasm32v1-none/release/escrow.wasm"
  );
  const escrowContractId = runCmd(
    `stellar contract deploy --wasm "${escrowWasmPath}" --source deployer --network testnet`
  );
  console.log(`Escrow Contract ID: ${escrowContractId}`);

  // 6. Deploy Challenge Manager Contract
  console.log("Deploying Challenge Manager contract to Testnet...");
  const managerWasmPath = path.resolve(
    __dirname,
    "../target/wasm32v1-none/release/challenge_manager.wasm"
  );
  const managerContractId = runCmd(
    `stellar contract deploy --wasm "${managerWasmPath}" --source deployer --network testnet`
  );
  console.log(`Challenge Manager Contract ID: ${managerContractId}`);

  // 7. Programmatic Initialization
  await initializeContracts(deployerKeypair, managerContractId, escrowContractId, nativeTokenSac);

  // 8. Write variables directly to .env.local file
  const envContent = `# Stellar Testnet Deployment Configuration
NEXT_PUBLIC_SOROBAN_RPC_URL=${SOROBAN_RPC_URL}
NEXT_PUBLIC_NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE}"
NEXT_PUBLIC_CHALLENGE_MANAGER_CONTRACT_ID=${managerContractId}
NEXT_PUBLIC_ESCROW_CONTRACT_ID=${escrowContractId}
`;

  fs.writeFileSync(path.resolve(__dirname, "../.env.local"), envContent);
  console.log("\n=== Success! ===");
  console.log("Contract addresses written directly to .env.local file.");
  console.log(`Challenge Manager ID: ${managerContractId}`);
  console.log(`Escrow Contract ID: ${escrowContractId}`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
