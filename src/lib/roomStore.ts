import { randomUUID } from "crypto";
import { DEFAULT_STRATEGY, PlanningStrategy, STRATEGIES } from "./strategies";
import type { RoomSummary } from "@/types/room";

export type Participant = {
  id: string;
  name: string;
  vote?: string;
  joinedAt: number;
  lastActiveAt: number;
};

export type Room = {
  id: string;
  strategy: PlanningStrategy;
  createdAt: number;
  updatedAt: number;
  revealed: boolean;
  participants: Participant[];
};

const roomStore = new Map<string, Room>();

export function createRoom(
  strategy: PlanningStrategy = DEFAULT_STRATEGY,
  hostName?: string,
) {
  validateStrategy(strategy);
  const id = generateReadableId();
  const timestamp = Date.now();

  const room: Room = {
    id,
    strategy,
    createdAt: timestamp,
    updatedAt: timestamp,
    revealed: false,
    participants: [],
  };

  roomStore.set(id, room);

  let hostParticipant: Participant | undefined;
  if (hostName) {
    hostParticipant = addParticipant(id, hostName).participant;
  }

  return { room, hostParticipant };
}

export function getRoom(roomId: string) {
  return roomStore.get(roomId);
}

export function getRoomSummary(roomId: string, exposeVoteFor?: string) {
  const room = getRoom(roomId);
  if (!room) {
    return undefined;
  }
  return serializeRoom(room, exposeVoteFor);
}

export function addParticipant(roomId: string, name: string, participantId?: string) {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  if (!name.trim()) {
    throw new Error("Name is required");
  }

  const timestamp = Date.now();
  let participant: Participant | undefined;

  if (participantId) {
    participant = room.participants.find((p) => p.id === participantId);
    if (participant) {
      participant.name = name.trim();
      participant.lastActiveAt = timestamp;
    }
  }

  if (!participant) {
    participant = {
      id: randomUUID(),
      name: name.trim(),
      joinedAt: timestamp,
      lastActiveAt: timestamp,
    };
    room.participants.push(participant);
  }

  room.updatedAt = timestamp;

  return { room, participant };
}

export function setVote(roomId: string, participantId: string, vote?: string) {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    throw new Error("Participant not found");
  }

  if (vote !== undefined) {
    ensureVoteIsValid(room.strategy, vote);
    participant.vote = vote;
  } else {
    delete participant.vote;
  }

  participant.lastActiveAt = Date.now();
  room.updatedAt = participant.lastActiveAt;
  return room;
}

export function revealVotes(roomId: string) {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }
  room.revealed = true;
  room.updatedAt = Date.now();
  return room;
}

export function resetVotes(roomId: string, strategy?: PlanningStrategy) {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  for (const participant of room.participants) {
    delete participant.vote;
  }

  if (strategy) {
    validateStrategy(strategy);
    room.strategy = strategy;
  }

  room.revealed = false;
  room.updatedAt = Date.now();
  return room;
}

export function changeStrategy(roomId: string, strategy: PlanningStrategy) {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }
  validateStrategy(strategy);
  resetVotes(roomId, strategy);
  return room;
}

export function serializeRoom(room: Room, exposeVoteFor?: string): RoomSummary {
  return {
    id: room.id,
    strategy: room.strategy,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    revealed: room.revealed,
    participants: room.participants.map((participant) => {
      const hasVoted = typeof participant.vote !== "undefined";
      const shouldExposeVote =
        room.revealed || participant.id === exposeVoteFor;
      return {
        id: participant.id,
        name: participant.name,
        hasVoted,
        vote: shouldExposeVote && hasVoted ? participant.vote! : null,
      };
    }),
  };
}

function validateStrategy(strategy: PlanningStrategy) {
  if (!STRATEGIES[strategy]) {
    throw new Error("Unsupported strategy");
  }
}

function ensureVoteIsValid(strategy: PlanningStrategy, vote: string) {
  const config = STRATEGIES[strategy];
  if (!config.values.includes(vote)) {
    throw new Error("Vote not allowed for current strategy");
  }
}

function generateReadableId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const idLength = 4;
  let result = "";
  for (let i = 0; i < idLength; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    result += alphabet[index];
  }
  if (roomStore.has(result)) {
    return generateReadableId();
  }
  return result;
}
