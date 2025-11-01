import { NextRequest, NextResponse } from "next/server";
import { getRoomSummary, resetVotes } from "@/lib/roomStore";
import { isPlanningStrategy } from "@/lib/strategies";
import type { PlanningStrategy } from "@/lib/strategies";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

type ResetPayload = {
  participantId?: string;
  strategy?: string;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  let payload: ResetPayload = {};
  try {
    payload = (await request.json()) as ResetPayload;
  } catch {
    // Ignore invalid payloads; we'll treat as empty
  }

  const { participantId, strategy } = payload;

  let normalizedStrategy: PlanningStrategy | undefined;
  if (strategy) {
    if (!isPlanningStrategy(strategy)) {
      return NextResponse.json(
        { error: "Unsupported strategy" },
        { status: 400 },
      );
    }
    normalizedStrategy = strategy;
  }

  try {
    resetVotes(normalizedRoomId, normalizedStrategy);
    const summary = getRoomSummary(normalizedRoomId, participantId);
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset votes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
