import { DEFAULT_STRATEGY, PlanningStrategy, STRATEGIES } from "./strategies";
import type { RoomSummary } from "@/types/room";

export type Participant = {
  id: string;
  name: string;
  vote?: string;
  joinedAt: number;
  lastActiveAt: number;
  ready: boolean;
};

export type Room = {
  id: string;
  strategy: PlanningStrategy;
  createdAt: number;
  updatedAt: number;
  revealed: boolean;
  participants: Participant[];
};

type RoomStoreGlobal = {
  __planningPokerRoomStore?: Map<string, Room>;
};

const globalScope = globalThis as RoomStoreGlobal;

const roomStore =
  globalScope.__planningPokerRoomStore ??
  (globalScope.__planningPokerRoomStore = new Map<string, Room>());

function generateParticipantId() {
  const cryptoRef = globalThis.crypto as Crypto | undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  return `participant-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

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
      if (typeof participant.ready === "undefined") {
        participant.ready = false;
      }
    }
  }

  if (!participant) {
    participant = {
      id: generateParticipantId(),
      name: name.trim(),
      joinedAt: timestamp,
      lastActiveAt: timestamp,
      ready: false,
    };
    room.participants.push(participant);
  }

  room.updatedAt = timestamp;

  return { room, participant };
}

export function setVote(
  roomId: string,
  participantId: string,
  vote?: string,
): { room: Room; autoRevealed: boolean } {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    throw new Error("Participant not found");
  }

  if (typeof participant.ready === "undefined") {
    participant.ready = false;
  }

  const previousVote = participant.vote;

  if (vote !== undefined) {
    ensureVoteIsValid(room.strategy, vote);
    participant.vote = vote;
  } else {
    delete participant.vote;
  }

  if (previousVote !== vote) {
    participant.ready = false;
  }

  participant.lastActiveAt = Date.now();
  room.updatedAt = participant.lastActiveAt;

  const shouldRevealNow = shouldAutoReveal(room);
  const autoRevealed = !room.revealed && shouldRevealNow;

  if (shouldRevealNow) {
    room.revealed = true;
  }

  return { room, autoRevealed };
}

export function setParticipantReady(
  roomId: string,
  participantId: string,
  ready: boolean,
): { room: Room; autoRevealed: boolean } {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    throw new Error("Participant not found");
  }

  if (typeof participant.ready === "undefined") {
    participant.ready = false;
  }

  if (ready && typeof participant.vote === "undefined") {
    throw new Error("Select a card before marking ready");
  }

  participant.ready = ready;
  participant.lastActiveAt = Date.now();
  room.updatedAt = participant.lastActiveAt;

  const shouldRevealNow = shouldAutoReveal(room);
  const autoRevealed = !room.revealed && shouldRevealNow;

  if (shouldRevealNow) {
    room.revealed = true;
  }

  return { room, autoRevealed };
}

export function removeParticipant(
  roomId: string,
  participantId: string,
): { room: Room; autoRevealed: boolean } {
  const room = roomStore.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const index = room.participants.findIndex((p) => p.id === participantId);
  if (index === -1) {
    throw new Error("Participant not found");
  }

  room.participants.splice(index, 1);
  room.updatedAt = Date.now();

  const shouldRevealNow = shouldAutoReveal(room);
  const autoRevealed = !room.revealed && shouldRevealNow;

  if (shouldRevealNow) {
    room.revealed = true;
  }

  return { room, autoRevealed };
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
    participant.ready = false;
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
        ready: Boolean(participant.ready),
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

function shouldAutoReveal(room: Room) {
  if (room.revealed) {
    return false;
  }
  if (room.participants.length === 0) {
    return false;
  }
  return room.participants.every(
    (participant) =>
      participant.ready && typeof participant.vote !== "undefined",
  );
}
