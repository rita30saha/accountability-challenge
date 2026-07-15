const { execSync } = require("child_process");
const path = require("path");

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

  // 2. Install new WASM byte code on chain to get hash
  console.log("Installing new WASM contract byte code to Testnet...");
  const wasmHash = runCmd(
    `stellar contract install --wasm "${wasmPath}" --source deployer --network testnet`
  );
  console.log(`New WASM Hash: ${wasmHash}`);

  // 3. Invoke contract 'upgrade' method
  console.log("Invoking 'upgrade' method on deployed contract...");
  runCmd(
    `stellar contract invoke --id ${contractId} --source deployer --network testnet -- upgrade --new_wasm_hash ${wasmHash}`
  );

  console.log("\n=== Success! ===");
  console.log(`Contract upgraded to WASM bytecode hash ${wasmHash} successfully.`);
}

main().catch((err) => {
  console.error("Upgrade failed:", err);
  process.exit(1);
});
