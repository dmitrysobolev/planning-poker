const STORAGE_PREFIX = "planning-poker";
const SESSION_PREFIX = `${STORAGE_PREFIX}:session`;

function normalizeRoomId(roomId: string) {
  return roomId.toUpperCase();
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function sessionKey(roomId: string) {
  return `${SESSION_PREFIX}:${normalizeRoomId(roomId)}`;
}

export function saveParticipant(roomId: string, participantId: string) {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  storage.setItem(sessionKey(roomId), participantId);
}

export function getParticipant(roomId: string) {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }
  return storage.getItem(sessionKey(roomId));
}

export function clearParticipant(roomId: string) {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(sessionKey(roomId));
}
