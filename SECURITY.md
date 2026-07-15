# Security Documentation

This document describes the validation rules, authentication checks, and client safety measures implemented in the Accountability Challenge protocol.

---

## 1. On-Chain Smart Contract Security

### 1. Cryptographic Authentication (`require_auth`)
Every function that changes the ownership or balance status of funds utilizes Soroban's native `require_auth()` signature verification:
* **`create_challenge`**: Verifies that the transaction signer matches the `creator` address.
* **`complete_challenge`**: Verifies that the transaction signer matches the `partner` address.
* **`fail_challenge`**: Verifies that the signer matches either the `creator` (voluntary admit) or the `partner` (verification decision).

### 2. Escrow Contract Isolation
The Escrow contract acts as an isolated, lock-protected vault:
* The `lock` and `release` methods verify that the caller is the `ChallengeManager` contract:
  ```rust
  let manager: Address = env.storage().instance().get(&DataKey::Manager).unwrap();
  manager.require_auth();
  ```
  This prevents any external wallet or contract from calling the Escrow contract directly to release or steal funds.
* Escrow only interacts with the Native Token contract (SAC) using the verified address configured during contract initialization.

### 3. Safe Re-Initialization Guards
All contract initializations are protected by a boolean flag stored in instance storage:
```rust
if env.storage().instance().has(&DataKey::Initialized) {
    panic!("Already initialized");
}
```
This ensures that contract variables (such as the admin, manager, token, and escrow addresses) cannot be overwritten after deployment.

---

## 2. Client & Interface Safety

### 1. Browser Sandbox Isolation
The Next.js client does not store private keys. It interacts with the blockchain through wallet extensions (Freighter, Albedo, xBull) using `@creit.tech/stellar-wallets-kit`.
* Private keys are stored securely inside the browser extension sandbox.
* The client only requests permission to sign transaction envelopes (XDR strings). It cannot sign arbitrary transactions without explicit user approval in the extension popup.

### 2. Input Validation & Sanitization
The Create Challenge form performs the following checks before building transactions:
* **Stellar Address Format**: Validates that the partner address matches the standard regex pattern `/^[G][A-D,I-Z][2-7,A-Z]{54}$/` to prevent sending funds to invalid addresses.
* **Self-Staking Prevention**: Rejects submissions if the creator sets their own address as the partner.
* **Deadline Verification**: Ensures that the deadline is set in the future (minimum 1 minute past local system time).
* **Positive Stakes**: Ensures the stake amount is greater than 0 XLM.

### 3. Safe Cache Resets
The settings page includes a "Clear Cache" button:
* It resets local storage items (preferences and transaction logs) and triggers a hard reload of the browser.
* No private information or credentials are leaked during this process.
