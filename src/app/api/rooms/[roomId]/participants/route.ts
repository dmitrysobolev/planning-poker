import { NextRequest, NextResponse } from "next/server";
import { addParticipant, getRoomSummary } from "@/lib/roomStore";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

type ParticipantPayload = {
  name?: string;
  participantId?: string;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  let body: ParticipantPayload;
  try {
    body = (await request.json()) as ParticipantPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json(
      { error: "A participant name is required" },
      { status: 400 },
    );
  }

  try {
    const { participant } = addParticipant(
      normalizedRoomId,
      body.name,
      body.participantId,
    );

    const summary = getRoomSummary(normalizedRoomId, participant.id);
    return NextResponse.json({
      participantId: participant.id,
      room: summary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join room";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
