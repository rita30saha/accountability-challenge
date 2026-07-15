import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { sorobanClient, CHALLENGE_MANAGER_CONTRACT_ID } from "../challenge/services";
import { Challenge, ChallengeStatus } from "../challenge/types";

export interface Activity {
  id: string;
  type: "created" | "active" | "completed" | "failed" | "locked" | "released";
  challengeTitle: string;
  challengeId: string;
  timestamp: number;
  txHash: string;
  status: ChallengeStatus;
}

export async function fetchRealEvents(): Promise<Activity[]> {
  if (!CHALLENGE_MANAGER_CONTRACT_ID) return [];
  try {
    const server = sorobanClient.getServer();
    
    // Get latest ledger first
    const latestLedgerRes = await server.getLatestLedger();
    const startLedger = Math.max(1, latestLedgerRes.sequence - 5000); // last 5000 ledgers

    const response = await server.getEvents({
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: [CHALLENGE_MANAGER_CONTRACT_ID],
        },
      ],
      limit: 50,
    });

    const activities: Activity[] = [];

    for (const event of response.events) {
      try {
        const topics = event.topic.map((t) => scValToNative(t));
        const eventType = topics[0]?.toString().toLowerCase();
        const challengeId = topics[1]?.toString() || "";

        if (!eventType || !challengeId) continue;

        let type: Activity["type"] = "created";
        let title = `Challenge #${challengeId}`;
        let status = ChallengeStatus.Active;

        if (eventType === "created") {
          type = "created";
          status = ChallengeStatus.Active;
        } else if (eventType === "active") {
          type = "active";
          status = ChallengeStatus.Active;
        } else if (eventType === "complete") {
          type = "completed";
          status = ChallengeStatus.Completed;
        } else if (eventType === "fail") {
          type = "failed";
          status = ChallengeStatus.Failed;
        } else if (eventType === "expire") {
          type = "failed";
          status = ChallengeStatus.Expired;
        } else {
          continue;
        }

        activities.push({
          id: event.id,
          type,
          challengeTitle: title,
          challengeId,
          timestamp: Number(event.ledgerClosedAt) || Math.floor(Date.now() / 1000),
          txHash: event.txHash,
          status,
        });
      } catch (err) {
        console.error("Failed to parse event", err);
      }
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.warn("Failed to fetch events from RPC, falling back to local simulation:", error);
    return [];
  }
}

export function generateSyntheticActivities(challenges: Challenge[]): Activity[] {
  const list: Activity[] = [];

  for (const c of challenges) {
    list.push({
      id: `syn-${c.id}-created`,
      type: "created",
      challengeTitle: c.title,
      challengeId: c.id,
      timestamp: c.createdAt,
      txHash: "Stellar Ledger Action",
      status: ChallengeStatus.Active,
    });
    
    list.push({
      id: `syn-${c.id}-locked`,
      type: "locked",
      challengeTitle: c.title,
      challengeId: c.id,
      timestamp: c.createdAt + 2,
      txHash: "Stellar Ledger Action",
      status: ChallengeStatus.Active,
    });

    list.push({
      id: `syn-${c.id}-active`,
      type: "active",
      challengeTitle: c.title,
      challengeId: c.id,
      timestamp: c.createdAt + 4,
      txHash: "Stellar Ledger Action",
      status: ChallengeStatus.Active,
    });

    if (c.status === ChallengeStatus.Completed) {
      list.push({
        id: `syn-${c.id}-completed`,
        type: "completed",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: Math.min(c.deadline, Math.floor(Date.now() / 1000) - 10),
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Completed,
      });
      list.push({
        id: `syn-${c.id}-released`,
        type: "released",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: Math.min(c.deadline, Math.floor(Date.now() / 1000) - 8),
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Completed,
      });
    } else if (c.status === ChallengeStatus.Failed) {
      list.push({
        id: `syn-${c.id}-failed`,
        type: "failed",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: Math.min(c.deadline, Math.floor(Date.now() / 1000) - 10),
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Failed,
      });
      list.push({
        id: `syn-${c.id}-released-partner`,
        type: "released",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: Math.min(c.deadline, Math.floor(Date.now() / 1000) - 8),
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Failed,
      });
    } else if (c.status === ChallengeStatus.Expired) {
      list.push({
        id: `syn-${c.id}-expired`,
        type: "failed",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: c.deadline,
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Expired,
      });
      list.push({
        id: `syn-${c.id}-claimed-partner`,
        type: "released",
        challengeTitle: c.title,
        challengeId: c.id,
        timestamp: c.deadline + 5,
        txHash: "Stellar Ledger Action",
        status: ChallengeStatus.Expired,
      });
    }
  }

  return list.sort((a, b) => b.timestamp - a.timestamp);
}
