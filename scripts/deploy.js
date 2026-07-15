const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const NATIVE_TOKEN_SAC = "CDLZFC3SYJYDZT7K6AOWJ3RLGWRLU75N32M6VXMGF5WSSWAAEX3NUGQN";

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

async function main() {
  console.log("=== Starting Stellar Testnet Deployment ===");

  // 1. Configure Testnet in Stellar CLI
  console.log("Configuring Stellar Testnet network profile...");
  runCmd(
    'stellar network add --global testnet --rpc-url "https://soroban-testnet.stellar.org" --network-passphrase "Test SDF Network ; September 2015"'
  );

  // 2. Generate and fund deployer account
  console.log("Generating deployer keypair (automatically funded via Friendbot)...");
  try {
    runCmd("stellar keys generate --network testnet deployer");
  } catch (e) {
    console.log("Deployer key already exists or generated.");
  }

  const deployerAddress = runCmd("stellar keys address deployer");
  console.log(`Deployer Stellar Address: ${deployerAddress}`);

  // 3. Build Smart Contracts
  console.log("Building smart contracts to WASM...");
  runCmd("stellar contract build");

  // 4. Deploy Escrow Contract
  console.log("Deploying Escrow contract to Testnet...");
  const escrowWasmPath = path.resolve(
    __dirname,
    "../target/wasm32-unknown-unknown/release/escrow.wasm"
  );
  const escrowContractId = runCmd(
    `stellar contract deploy --wasm "${escrowWasmPath}" --source deployer --network testnet`
  );
  console.log(`Escrow Contract ID: ${escrowContractId}`);

  // 5. Deploy Challenge Manager Contract
  console.log("Deploying Challenge Manager contract to Testnet...");
  const managerWasmPath = path.resolve(
    __dirname,
    "../target/wasm32-unknown-unknown/release/challenge_manager.wasm"
  );
  const managerContractId = runCmd(
    `stellar contract deploy --wasm "${managerWasmPath}" --source deployer --network testnet`
  );
  console.log(`Challenge Manager Contract ID: ${managerContractId}`);

  // 6. Initialize Escrow Contract
  console.log("Initializing Escrow contract...");
  runCmd(
    `stellar contract invoke --id ${escrowContractId} --source deployer --network testnet -- initialize --manager ${managerContractId} --token ${NATIVE_TOKEN_SAC}`
  );

  // 7. Initialize Challenge Manager Contract
  console.log("Initializing Challenge Manager contract...");
  runCmd(
    `stellar contract invoke --id ${managerContractId} --source deployer --network testnet -- initialize --admin ${deployerAddress} --escrow ${escrowContractId} --token ${NATIVE_TOKEN_SAC}`
  );

  // 8. Write to .env.local file
  const envContent = `# Stellar Testnet Deployment Configuration
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
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
