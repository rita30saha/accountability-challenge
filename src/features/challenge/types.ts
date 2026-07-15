export enum ChallengeStatus {
  Created = 0,
  Active = 1,
  Completed = 2,
  Failed = 3,
  Expired = 4,
}

export interface Challenge {
  id: string;
  creator: string;
  title: string;
  description: string;
  amount: string; // Staked XLM represented as a string decimal (or stroops string)
  deadline: number; // Unix timestamp in seconds
  partner: string;
  status: ChallengeStatus;
  createdAt: number;
}
