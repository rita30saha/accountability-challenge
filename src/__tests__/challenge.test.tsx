import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/features/challenge/ui/status-badge";
import { ChallengeCard } from "@/features/challenge/ui/challenge-card";
import { DashboardSummary } from "@/features/challenge/ui/dashboard-summary";
import { Challenge, ChallengeStatus } from "@/features/challenge/types";

// Mock Lucide icons to prevent render failures
import { vi } from "vitest";
vi.mock("lucide-react", () => ({
  Coins: () => <div data-testid="icon-coins" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  ArrowUpRight: () => <div data-testid="icon-arrow" />,
  Award: () => <div data-testid="icon-award" />,
  Flame: () => <div data-testid="icon-flame" />,
  CheckCircle: () => <div data-testid="icon-check" />,
  CheckCircle2: () => <div data-testid="icon-check-2" />,
  ShieldAlert: () => <div data-testid="icon-shield" />,
}));

const mockChallenge: Challenge = {
  id: "1",
  creator: "GBTESTACCOUNTW4LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3X",
  title: "Exercise Daily",
  description: "Walk 10,000 steps every single day.",
  amount: "50",
  deadline: 1784112000, // Year 2026 future date
  partner: "GBPARTNER3LLET5D6E7F8G9H0J1K2L3M4N5P6Q7R8S9T0U1V2W3Y",
  status: ChallengeStatus.Active,
  createdAt: 1784102000,
};

describe("StatusBadge Component", () => {
  test("renders Created status correctly", () => {
    render(<StatusBadge status={ChallengeStatus.Created} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  test("renders Active status correctly", () => {
    render(<StatusBadge status={ChallengeStatus.Active} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("renders Completed status correctly", () => {
    render(<StatusBadge status={ChallengeStatus.Completed} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

describe("ChallengeCard Component", () => {
  test("renders title, stake and truncated addresses", () => {
    render(<ChallengeCard challenge={mockChallenge} />);
    
    expect(screen.getByText("Exercise Daily")).toBeInTheDocument();
    expect(screen.getByText("Walk 10,000 steps every single day.")).toBeInTheDocument();
    expect(screen.getByText("50 XLM")).toBeInTheDocument();
    
    // Check truncated addresses
    expect(screen.getByText(/Creator:\s*GBTES\.\.\.V2W3X/i)).toBeInTheDocument();
    expect(screen.getByText(/Partner:\s*GBPAR\.\.\.V2W3Y/i)).toBeInTheDocument();
  });
});

describe("DashboardSummary Component", () => {
  test("renders aggregated stats correctly", () => {
    const mockChallenges: Challenge[] = [
      { ...mockChallenge, id: "1", status: ChallengeStatus.Active, amount: "50" },
      { ...mockChallenge, id: "2", status: ChallengeStatus.Completed, amount: "30" },
      { ...mockChallenge, id: "3", status: ChallengeStatus.Failed, amount: "20" },
    ];

    render(<DashboardSummary challenges={mockChallenges} />);

    expect(screen.getByText("Total Challenges")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Active Stakes")).toBeInTheDocument();
    expect(screen.getByText("Completed Goals")).toBeInTheDocument();
    expect(screen.getByText("Failed / Expired")).toBeInTheDocument();
    
    // Check that we have exactly 3 indicators with value '1'
    expect(screen.getAllByText("1")).toHaveLength(3);

    expect(screen.getByText("Total Active XLM Staked")).toBeInTheDocument();
    expect(screen.getByText("50.00 XLM")).toBeInTheDocument();
  });
});
