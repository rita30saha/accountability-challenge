# User Guide: Getting Started

Follow this guide to set up your wallet, fund it on Testnet, and start creating accountability challenges.

---

## 1. Setting Up Your Wallet

The application supports Freighter, Albedo, and xBull browser extensions. We recommend **Freighter**.

### Install Freighter:
1. Download and install the Freighter extension from [freighter.app](https://www.freighter.app/).
2. Create a new wallet and record your recovery seed phrase securely.
3. Open the Freighter extension, go to Settings (cog icon), select **Network**, and switch it to **Testnet**.

---

## 2. Funding Your Wallet on Testnet

Before you can stake XLM, you need testnet funds:
1. Copy your public key address from the Freighter extension.
2. Go to the [Stellar Laboratory Friendbot Tool](https://laboratory.stellar.org/#account-creator?network=testnet).
3. Paste your public address in the text box and click **Get Test Net XLM**.
4. Your account will be instantly created and funded with 10,000 Testnet XLM.

---

## 3. Connecting to the Web App

1. Open the Accountability Challenge application in your browser.
2. Click the **Connect Wallet** button in the navigation bar.
3. Select your wallet provider (e.g., Freighter).
4. Approve the connection request in the wallet extension popup.
5. Your public address will be displayed in the navigation bar, confirming a successful connection.

---

## 4. Creating a Challenge

1. Navigate to the **Create** page from the navigation bar.
2. Fill out the form:
   * **Title**: A short summary of your goal (e.g., "Study Rust daily").
   * **Description**: Define the specific completion criteria.
   * **Stake Amount (XLM)**: The amount of XLM you wish to stake.
   * **Deadline**: Select a future date and time for completion.
   * **Partner Address**: Enter the Stellar public key (starts with G) of your partner.
3. Click **Create Challenge & Lock Stake**.
4. Confirm and sign the transaction request in your wallet popup.
5. Once confirmed, you will be redirected to the success screen showing your transaction hash.

---

## 5. Resolving a Challenge

### Case 1: Completion (Success)
1. You complete your goal before the deadline.
2. Your **Accountability Partner** connects their wallet to the web app, navigates to the **Challenge Details** page for your goal, and clicks **Mark as Completed**.
3. The partner signs the transaction.
4. The staked XLM is returned to your wallet.

### Case 2: Failure
* **Voluntary Admission**: You can click **Voluntary Admit Failure** on the Challenge Details page at any time. The staked XLM will be instantly transferred to your partner.
* **Partner Rejection**: Your partner can click **Mark as Failed** on the Challenge Details page to trigger the escrow penalty and claim the funds.

### Case 3: Expiration
1. The deadline passes and the challenge is still active.
2. Your partner navigates to the Challenge Details page and clicks **Claim Stake (Goal Failed)**.
3. The staked XLM is transferred to your partner's wallet.
