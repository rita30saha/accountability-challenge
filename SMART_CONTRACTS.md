# Smart Contract Documentation

This document describes the entry points, storage keys, validation rules, and event specifications of the Soroban smart contracts.

---

## 1. Challenge Manager Contract

Manages challenge state records, validates goal deadlines, and acts as the authorized coordinator for the Escrow Contract.

### 1. Storage Layout
* **DataKey::Admin**: Instance storage. Stores the admin Address (typically the deployer).
* **DataKey::Escrow**: Instance storage. Stores the address of the deployed Escrow contract.
* **DataKey::Token**: Instance storage. Stores the address of the Native XLM Token contract (SAC).
* **DataKey::Initialized**: Instance storage. Boolean flag preventing re-initialization.
* **DataKey::Counter**: Instance storage. `u64` counter tracks the latest challenge ID.
* **DataKey::Challenge(id)**: Persistent storage. Maps challenge ID (`u64`) to a `Challenge` struct.

### 2. Method Signatures
```rust
pub fn initialize(env: Env, admin: Address, escrow: Address, token: Address);
```
* Initializes contract configurations. Panics if already initialized.

```rust
pub fn create_challenge(env: Env, creator: Address, partner: Address, title: String, description: String, amount: i128, deadline: u64) -> u64;
```
* Registers a challenge. Increments counter, calls `escrow.lock`, and emits a `created` event.
* **Validations**:
  * Creator must sign (`creator.require_auth()`).
  * Deadline must be a future Unix timestamp (`deadline > env.ledger().timestamp()`).
  * Stake amount must be positive (`amount > 0`).

```rust
pub fn complete_challenge(env: Env, id: u64);
```
* Resolves a challenge as successful. Releases the locked stake back to the creator.
* **Validations**:
  * Accountability partner must authorize (`partner.require_auth()`).
  * Challenge status must be `Active`.
  * Deadline must not have passed.

```rust
pub fn fail_challenge(env: Env, id: u64, caller: Address);
```
* Resolves a challenge as failed. Transfers the locked stake to the partner.
* **Validations**:
  * Caller must authorize (`caller.require_auth()`).
  * Caller must be either the `creator` or the `partner`.
  * Challenge status must be `Active`.

```rust
pub fn expire_challenge(env: Env, id: u64);
```
* Closes an expired challenge. Releases locked stake to the partner.
* **Validations**:
  * Challenge status must be `Active`.
  * Current time must be past the deadline (`env.ledger().timestamp() > deadline`).

```rust
pub fn get_challenge(env: Env, id: u64) -> Option<Challenge>;
```
* Query helper. Returns challenge details or `None` if the ID is not found.

```rust
pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>);
```
* Upgrades the contract WASM. Restricted to the `admin` address.

---

## 2. Escrow Contract

Holds staked XLM tokens and manages token releases.

### 1. Storage Layout
* **DataKey::Manager**: Instance storage. Stores the address of the Challenge Manager contract.
* **DataKey::Token**: Instance storage. Stores the address of the Native XLM Token contract (SAC).
* **DataKey::Initialized**: Instance storage. Boolean flag preventing re-initialization.

### 2. Method Signatures
```rust
pub fn initialize(env: Env, manager: Address, token: Address);
```
* Initializes configurations. Panics if already initialized.

```rust
pub fn lock(env: Env, from: Address, amount: i128, challenge_id: u64);
```
* Transfers tokens from the creator's address to the Escrow contract's balance.
* **Validations**:
  * Caller must be the Challenge Manager contract (`manager.require_auth()`).
  * Signer must authorize (`from.require_auth()`).
  * Amount must be positive (`amount > 0`).

```rust
pub fn release(env: Env, to: Address, amount: i128, challenge_id: u64);
```
* Transfers tokens from the Escrow contract's balance to the target address (`to`).
* **Validations**:
  * Caller must be the Challenge Manager contract (`manager.require_auth()`).

```rust
pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>);
```
* Upgrades the contract WASM. Restricted to the `manager` address.

---

## 3. Events Audit Log Specifications

Smart contracts publish standard event topics to allow indexing and auditing:

| Contract | Event Topic | Event Value | Condition |
| :--- | :--- | :--- | :--- |
| **Challenge Manager** | `(Symbol("created"), challenge_id, creator)` | `(partner, amount, deadline)` | Challenge created successfully |
| **Challenge Manager** | `(Symbol("complete"), challenge_id)` | `creator` | Challenge resolved as Completed |
| **Challenge Manager** | `(Symbol("fail"), challenge_id)` | `partner` | Challenge resolved as Failed |
| **Challenge Manager** | `(Symbol("expire"), challenge_id)` | `partner` | Expiry claimed |
| **Escrow** | `(Symbol("lock"), challenge_id, from)` | `amount` | Tokens locked in escrow |
| **Escrow** | `(Symbol("release"), challenge_id, to)` | `amount` | Tokens released from escrow |
