import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  AlbedoModule,
  xBullModule,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import { Networks } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || Networks.TESTNET;

export type WalletType = typeof FREIGHTER_ID | typeof ALBEDO_ID | typeof XBULL_ID;

class WalletService {
  private kit: StellarWalletsKit | null = null;

  private getKit(): StellarWalletsKit {
    if (!this.kit) {
      this.kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
        ],
      });
    }
    return this.kit;
  }

  async connect(walletType: WalletType): Promise<string> {
    const kit = this.getKit();
    kit.setWallet(walletType);
    const result = await kit.getAddress();
    if (!result || !result.address) {
      throw new Error("Could not retrieve public key from wallet.");
    }
    return result.address;
  }

  async signTransaction(xdr: string): Promise<string> {
    const kit = this.getKit();
    const result = await kit.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return result.signedTxXdr;
  }
}

export const walletService = new WalletService();
export { FREIGHTER_ID, ALBEDO_ID, XBULL_ID };
