import { PlanningStrategy } from "@/lib/strategies";

export type ParticipantSummary = {
  id: string;
  name: string;
  vote: string | null;
  hasVoted: boolean;
  ready: boolean;
};

export type RoomSummary = {
  id: string;
  strategy: PlanningStrategy;
  createdAt: number;
  updatedAt: number;
  revealed: boolean;
  participants: ParticipantSummary[];
};
