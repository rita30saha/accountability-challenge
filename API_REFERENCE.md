# API / Service Layer Reference

This document maps the classes, helper functions, state properties, and actions exposed by the TypeScript service layers.

---

## 1. Wallet Service (`src/features/wallet/services.ts`)

Encapsulates interactions with the `@creit.tech/stellar-wallets-kit` SDK.

### `walletService` (Singleton Instance)
* **`connect(walletType: WalletType): Promise<string>`**
  * Configures the active wallet type, requests address permissions, and returns the public key address.
  * **Parameters**: `walletType` (`"freighter" | "albedo" | "xbull"`).
  * **Returns**: Promise resolving to the public key string.
* **`signTransaction(xdr: string): Promise<string>`**
  * Requests the user's wallet to sign the base64-encoded transaction envelope.
  * **Parameters**: `xdr` (string).
  * **Returns**: Promise resolving to the signed transaction XDR base64 envelope.

---

## 2. Soroban Client Service (`src/features/challenge/services.ts`)

Manages contract invocations and query simulations.

### `SorobanClient` (Class)
* **`sendTransaction(signedTx: Transaction): Promise<string>`**
  * Submits the signed transaction to the RPC node and polls for execution results.
  * **Returns**: Promise resolving to the transaction hash string.

### Contract Operations (Helpers)
* **`getChallenge(id: string): Promise<Challenge | null>`**
  * Simulates a `get_challenge` call. Decodes the response into a `Challenge` object.
* **`getAllChallenges(): Promise<Challenge[]>`**
  * Queries challenges sequentially in parallel batches of 10 until it hits a null return.
* **`createChallengeContract(creator, partner, title, description, amount, deadlineUnix): Promise<string>`**
  * Prepares, simulates, assembles, requests wallet signatures, and submits a `create_challenge` transaction.
  * **Returns**: Promise resolving to the submission transaction hash.
* **`completeChallengeContract(partner, id): Promise<string>`**
  * Prepares, simulates, signs, and submits a `complete_challenge` transaction.
* **`failChallengeContract(caller, id): Promise<string>`**
  * Prepares, simulates, signs, and submits a `fail_challenge` transaction.
* **`expireChallengeContract(caller, id): Promise<string>`**
  * Prepares, simulates, signs, and submits a `expire_challenge` transaction.

---

## 3. Zustand Stores

### 1. Challenge Store State (`src/features/challenge/state.ts`)
* **State Variables**:
  * `challenges`: `Challenge[]` (all cached challenges).
  * `currentChallenge`: `Challenge | null` (active details page state).
  * `isLoading`: `boolean` (view fetching flag).
  * `isWriting`: `boolean` (write transaction submitting flag).
  * `error`: `string | null` (submission/query errors).
  * `txHash`: `string | null` (last confirmed tx hash).
* **Actions**:
  * `fetchChallenges()`: Refreshes challenges list.
  * `fetchChallengeById(id: string)`: Fetches a single challenge.
  * `createChallenge(...)`, `completeChallenge(...)`, `failChallenge(...)`, `expireChallenge(...)`: Invoke respective service wrappers.

### 2. Transaction Store State (`src/features/transactions/state.ts`)
* **State Variables**:
  * `transactions`: `TrackedTransaction[]` (local persistent transaction logs).
* **Actions**:
  * `addTransaction(tx)`: Registers a transaction.
  * `updateTransactionStatus(hash, status, error)`: Updates status (`"pending" | "processing" | "confirmed" | "failed"`).
  * `clearTransactions()`: Clears persistent transaction logs.

### 3. Settings Store State (`src/features/settings/state.ts`)
* **State Variables**:
  * `refreshInterval`: `number` (polling interval in seconds: `5`, `10`, or `30`).
  * `theme`: `"light" | "dark" | "system"` (color layout preference).
  * `notifications`: `boolean` (alerts toggles).
* **Actions**:
  * `setRefreshInterval(val)`, `setTheme(val)`, `setNotifications(val)`: Update state.
