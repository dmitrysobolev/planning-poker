const STORAGE_PREFIX = "planning-poker";

export function storageKey(roomId: string) {
  return `${STORAGE_PREFIX}:${roomId.toUpperCase()}`;
}

export function saveParticipant(roomId: string, participantId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey(roomId), participantId);
}

export function getParticipant(roomId: string) {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(storageKey(roomId));
}

export function clearParticipant(roomId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(storageKey(roomId));
}
