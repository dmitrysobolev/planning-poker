import { NextRequest, NextResponse } from "next/server";
import { serializeRoom, setVote } from "@/lib/roomStore";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

type VotePayload = {
  participantId?: string;
  vote?: string | null;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  let body: VotePayload;
  try {
    body = (await request.json()) as VotePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.participantId || typeof body.participantId !== "string") {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 },
    );
  }

  try {
    const { room, autoRevealed } = setVote(
      normalizedRoomId,
      body.participantId,
      body.vote ?? undefined,
    );
    const summary = serializeRoom(room, body.participantId);
    return NextResponse.json({
      ...summary,
      autoRevealed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update vote";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
