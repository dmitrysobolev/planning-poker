import { NextResponse } from "next/server";
import { removeParticipant, serializeRoom } from "@/lib/roomStore";

type RouteContext = {
  params: Promise<{ roomId: string; participantId: string }>;
};

export const runtime = "edge";

export async function DELETE(_: Request, context: RouteContext) {
  const { roomId, participantId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();

  try {
    const { room, autoRevealed } = removeParticipant(normalizedRoomId, participantId);
    const summary = serializeRoom(room);
    return NextResponse.json({
      ...summary,
      autoRevealed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove participant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
