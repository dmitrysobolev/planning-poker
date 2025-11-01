import { NextRequest, NextResponse } from "next/server";
import { getRoomSummary, revealVotes } from "@/lib/roomStore";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

type RevealPayload = {
  participantId?: string;
};

export const runtime = "edge";

export async function POST(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  let participantId: string | undefined;
  try {
    const body = (await request.json()) as RevealPayload | undefined;
    if (body && typeof body.participantId === "string") {
      participantId = body.participantId;
    }
  } catch {
    // ignore invalid JSON and continue without participant context
  }

  try {
    revealVotes(normalizedRoomId);
    const summary = getRoomSummary(normalizedRoomId, participantId);
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reveal votes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
