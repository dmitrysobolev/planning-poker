import { NextRequest, NextResponse } from "next/server";
import { changeStrategy, getRoom, getRoomSummary, serializeRoom } from "@/lib/roomStore";
import { isPlanningStrategy } from "@/lib/strategies";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();
  const exposeVoteFor =
    request.nextUrl.searchParams.get("participantId") ?? undefined;

  const summary = getRoomSummary(normalizedRoomId, exposeVoteFor ?? undefined);
  if (!summary) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(summary);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { roomId } = await context.params;
  const normalizedRoomId = roomId.toUpperCase();
  const room = getRoom(normalizedRoomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("strategy" in payload) ||
    typeof (payload as { strategy: unknown }).strategy !== "string"
  ) {
    return NextResponse.json(
      { error: "strategy must be provided" },
      { status: 400 },
    );
  }

  const strategy = (payload as { strategy: string }).strategy;

  if (!isPlanningStrategy(strategy)) {
    return NextResponse.json({ error: "Unsupported strategy" }, { status: 400 });
  }

  const updatedRoom = changeStrategy(normalizedRoomId, strategy);
  return NextResponse.json(serializeRoom(updatedRoom));
}
