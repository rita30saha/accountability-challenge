# Changelog

All notable changes to the **Accountability Challenge** project will be documented in this file.

---

## [0.1.0-alpha] - 2026-07-16

This is the initial alpha release of the Stellar Accountability Challenge platform, fulfilling the Stellar Orange Belt (Level 3) requirements.

### Added

#### Smart Contracts (Soroban)
* **Challenge Manager Contract**:
  * Implemented challenge registration and state structures.
  * Configured state transitions for `Created`, `Active`, `Completed`, `Failed`, and `Expired` challenges.
  * Added validation checks for deadlines, positive stake values, and caller roles.
  * Integrated an `upgrade(new_wasm_hash)` method with admin authorization guards.
* **Escrow Contract**:
  * Configured secure token lock and release operations.
  * Restricted contract access to the verified Challenge Manager address.
  * Integrated an `upgrade(new_wasm_hash)` method with manager authorization guards.

#### Frontend Application (Next.js 15)
* **Wallet Integration**:
  * Switched connection package to `@creit.tech/stellar-wallets-kit`.
  * Added connection adapters for Freighter, Albedo, and xBull.
  * Created a persistent Zustand wallet store.
* **Challenge Management Module**:
  * Built interactive Create Challenge forms with format checks.
  * Generated detailed challenge inspection views with role-based buttons (Mark Completed, Voluntary Fail, Expiry Claims).
  * Built dynamic stats dashboards.
* **Activity & Audit**:
  * Created a real-time Activity Feed polling contract events from the RPC every 5 seconds.
  * Generated a persistent Transaction Center auditing transaction hashes, actions, and explorer redirects.
* **Settings & Diagnostics**:
  * Added configuration settings for polling intervals and UI layouts.
  * Added cache clear triggers and JSON exports for offline backup histories.
* **Analytics**:
  * Integrated calculations showing won vs lost XLM, TVL, and rate metrics.

#### Quality Assurance & Infra
* **Testing Suit**:
  * Wrote 9 contract unit tests in Rust.
  * Wrote 11 Vitest/JSDOM component and store integration flow tests.
* **CI/CD Workflows**:
  * Configured GitHub Actions checking Rust compilations, cargo tests, node installations, and next builds.
* **Deployment Utilities**:
  * Built automated `deploy.js` and `upgrade.js` scripts.
