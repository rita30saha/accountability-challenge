# Deployment Guide: Stellar Testnet

This guide explains how to compile, deploy, and initialize the Soroban smart contracts on the Stellar Testnet.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
* **Rust Toolchain**: `rustup` stable.
* **Wasm32 Target**: `rustup target add wasm32-unknown-unknown`.
* **Stellar CLI**: version `25.2.0` or higher.
* **Node.js**: version `20` or higher.

---

## 2. Network Configuration

Add the Stellar Testnet network profile to your global CLI settings:
```bash
stellar network add --global testnet \
  --rpc-url "https://soroban-testnet.stellar.org" \
  --network-passphrase "Test SDF Network ; September 2015"
```

---

## 3. Account Provisioning

Generate a deployer keypair. The CLI automatically requests Friendbot to fund it:
```bash
stellar keys generate --network testnet deployer
```
Verify that the account was created and check its public key:
```bash
stellar keys address deployer
```

---

## 4. Compile and Deploy Contracts

### 1. Build WASM Bytecode:
```bash
stellar contract build
```
This compiles the Rust contracts and outputs the `.wasm` binaries to:
* `target/wasm32-unknown-unknown/release/challenge_manager.wasm`
* `target/wasm32-unknown-unknown/release/escrow.wasm`

### 2. Deploy Escrow Contract:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source deployer \
  --network testnet
```
*Save the returned Contract ID (e.g., `C...`).*

### 3. Deploy Challenge Manager Contract:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/challenge_manager.wasm \
  --source deployer \
  --network testnet
```
*Save the returned Contract ID.*

---

## 5. Programmatic Initialization

Both contracts must be initialized with their respective addresses. The native XLM Token contract address (SAC) on Testnet is always `CDLZFC3SYJYDZT7K6AOWJ3RLGWRLU75N32M6VXMGF5WSSWAAEX3NUGQN`.

### 1. Initialize Escrow Contract:
```bash
stellar contract invoke \
  --id <escrow-contract-id> \
  --source deployer \
  --network testnet \
  -- initialize \
  --manager <challenge-manager-contract-id> \
  --token CDLZFC3SYJYDZT7K6AOWJ3RLGWRLU75N32M6VXMGF5WSSWAAEX3NUGQN
```

### 2. Initialize Challenge Manager Contract:
```bash
stellar contract invoke \
  --id <challenge-manager-contract-id> \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin <deployer-address> \
  --escrow <escrow-contract-id> \
  --token CDLZFC3SYJYDZT7K6AOWJ3RLGWRLU75N32M6VXMGF5WSSWAAEX3NUGQN
```

---

## 6. Verification Steps

1. Copy the deployed contract ID.
2. Go to the [Stellar.expert Testnet Explorer](https://stellar.expert/explorer/testnet/).
3. Paste the contract ID in the search bar.
4. Verify that the contract details are displayed and showing transaction histories for the `initialize` call.

---

## 7. Troubleshooting

* **Out of Funds**: If the deployer account runs out of funds, request testnet XLM using the [Stellar Laboratory Friendbot tool](https://laboratory.stellar.org/#account-creator?network=testnet) by entering the deployer's public address.
* **Already Initialized**: If you encounter an error stating "Already initialized", you cannot re-initialize the contract. You must deploy a new instance of the contract.
