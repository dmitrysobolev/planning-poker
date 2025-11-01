import { NextRequest, NextResponse } from "next/server";
import { serializeRoom, setParticipantReady } from "@/lib/roomStore";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

type ReadyPayload = {
  participantId?: string;
  ready?: boolean;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  let body: ReadyPayload;
  try {
    body = (await request.json()) as ReadyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.participantId || typeof body.participantId !== "string") {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 },
    );
  }

  const ready =
    typeof body.ready === "boolean"
      ? body.ready
      : true;

  try {
    const { room, autoRevealed } = setParticipantReady(
      normalizedRoomId,
      body.participantId,
      ready,
    );
    const summary = serializeRoom(room, body.participantId);
    return NextResponse.json({
      ...summary,
      autoRevealed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update ready state";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
