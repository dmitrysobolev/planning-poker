import { NextResponse } from "next/server";
import {
  PlanningStrategy,
  DEFAULT_STRATEGY,
  isPlanningStrategy,
} from "@/lib/strategies";
import { createRoom } from "@/lib/roomStore";

type CreateRoomPayload = {
  strategy?: PlanningStrategy | string;
  hostName?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoomPayload;
    const rawStrategy = body.strategy ?? DEFAULT_STRATEGY;

    if (typeof rawStrategy !== "string") {
      return NextResponse.json(
        { error: "strategy must be a string" },
        { status: 400 },
      );
    }

    const strategy = isPlanningStrategy(rawStrategy)
      ? rawStrategy
      : undefined;

    if (!strategy) {
      return NextResponse.json(
        { error: "Unsupported strategy" },
        { status: 400 },
      );
    }

    const hostName =
      typeof body.hostName === "string" ? body.hostName.trim() : undefined;

    const { room, hostParticipant } = createRoom(strategy, hostName);

    return NextResponse.json({
      roomId: room.id,
      participantId: hostParticipant?.id ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
